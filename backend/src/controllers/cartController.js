import ShoppingCart from "../models/ShoppingCart.js";
import ShoppingCartItem from "../models/ShoppingCartItem.js";
import ShoeSizeInventory from "../models/ShoeSizeInventory.js";
import RefCurrency from "../models/RefCurrency.js";
import Shoe from "../models/Shoe.js";
import Branch from "../models/Branch.js";
import { transaction } from "objection";
import { updateCartCurrency } from "../services/updateCartCurrency.js";
import { getCartForUser, createCartForUser, validateCartItemStock } from "../services/cartService.js";

/**
 * Get the current user's shopping cart with items and totals
 */
export async function getCartHandler(req, res) {
  try {
    const userId = req.user.user_id;
    const { branch_id } = req.params;

    if (!branch_id) {
      return res.status(400).json({ error: "branch_id parameter is required" });
    }

    // Get cart with branch info
    const cart = await ShoppingCart.query()
      .findOne({ user_id: userId, branch_id })
      .withGraphFetched("branch");

    if (!cart) {
      return res.status(404).json({ error: "Shopping cart not found for the specified branch" });
    }

    // Get cart items with shoe details and inventory
    const cartItems = await ShoppingCartItem.query()
      .where("cart_id", cart.cart_id)
      .withGraphFetched("shoe.[brand, images]")
      .withGraphFetched("inventory");

    // Format items for response (prices are already in cart's currency)
    const items = cartItems.map((item) => ({
      cart_item_id: item.cart_item_id,
      shoe_id: item.shoe_id,
      shoe_name: item.shoe?.name || "Unknown",
      brand_name: item.shoe?.brand?.brand_name || "Unknown",
      shoe_image: item.shoe?.images?.[0]?.img_path || null,
      size: item.shoe_us_size,
      quantity: item.quantity,
      price: parseFloat(item.price_at_addition),
      subtotal: item.quantity * parseFloat(item.price_at_addition),
      available_stock: item.inventory?.stock || 0,
      is_in_stock: item.inventory && item.inventory.stock > 0,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
      cart_id: cart.cart_id,
      branch_id: cart.branch_id,
      branch_name: cart.branch?.branch_name || null,
      currency_code: cart.currency_code,
      currency_rate_to_peso: cart.currency_rate_to_peso,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total_items: totalItems,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({ 
      error: "Failed to get shopping cart",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}



/**
 * Create a new shopping cart for the user for a specific branch
 */
export async function createCartForUserHandler(req, res) {
  try {
    const userId = req.user.user_id;
    const { branch_id, currency_code, currency_rate_to_peso } = req.body;

    // If branch_id is missing, return error
    if (!branch_id) {
      return res.status(400).json({ error: "branch_id is required" });
    }

    // Validate branch existence
    const branch = await Branch.query().findById(branch_id);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Validate currency if provided
    if (currency_code) {
      const currency = await RefCurrency.query().findById(currency_code);
      if (!currency) {
        return res.status(404).json({ error: "Currency not found" });
      }
    }

    // Check if cart already exists for this user and branch
    const existingCart = await getCartForUser(userId, branch_id);
    if (existingCart) {
      return res.status(400).json({ error: "Cart already exists for this branch" });
    }

    // Create the cart
    const newCart = await createCartForUser(userId, branch_id, currency_code, currency_rate_to_peso);
    return res.status(201).json({
      message: "Shopping cart created successfully",
      cart_id: newCart.cart_id,
      branch_id: newCart.branch_id,
      currency_code: newCart.currency_code,
      currency_rate_to_peso: newCart.currency_rate_to_peso,
    });
  } catch (error) {
    console.error("Create cart error:", error);
    return res.status(500).json({ error: "Failed to create shopping cart" });
  }
}

export async function updateCartCurrencyHandler(req, res) {
  try {
    const user_id = req.user.user_id;
    const { cart_id } = req.params;
    const { currency_code, currency_rate_to_peso } = req.body;

    const updatedCart = await updateCartCurrency(user_id, cart_id, currency_code, currency_rate_to_peso);
    
    return res.json({
      message: "Cart currency updated successfully",
      cart_id: updatedCart.cart_id,
      currency_code: updatedCart.currency_code,
      currency_rate_to_peso: updatedCart.currency_rate_to_peso,
    });
  } catch (error) {
    console.error("Update cart currency error:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to update cart currency" });
  }
} 

/**
 * Add an item to the shopping cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { shoe_id, shoe_us_size, branch_id, quantity = 1, currency_code = 'PHP', currency_rate_to_peso = 1 } = req.body;

    // Validate input
    if (!shoe_id || !shoe_us_size || !branch_id) {
      return res.status(400).json({
        error: "Missing required fields: shoe_id, shoe_us_size, branch_id",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const knex = ShoppingCart.knex();

    try {
      const result = await transaction(knex, async (trx) => {
        // Check if shoe exists and get current price (in PHP)
        const shoe = await Shoe.query(trx).findById(shoe_id).where("is_deleted", false);

        if (!shoe) {
          throw { statusCode: 404, message: "Shoe not found" };
        }

        // Check inventory availability using cartService helper
        const stockValidation = await validateCartItemStock(shoe_id, shoe_us_size, branch_id, quantity);
        if (!stockValidation.valid) {
          throw {
            statusCode: 400,
            message: stockValidation.error,
            available_stock: stockValidation.availableStock,
          };
        }

        // Find or create cart for user
        let cart = await ShoppingCart.query(trx).findOne({ user_id: userId, branch_id });

        if (!cart) {
          // Create new cart with currency initialization
          cart = await ShoppingCart.query(trx).insert({
            user_id: userId,
            branch_id: branch_id,
            currency_code: currency_code || 'PHP',
            currency_rate_to_peso: currency_rate_to_peso || 1
          });
        }

        // Get cart with currency info
        const cartWithCurrency = await ShoppingCart.query(trx).findById(cart.cart_id);
        
        // Store the ORIGINAL PHP price (don't convert yet)
        // Conversion will happen on frontend based on selected currency
        const phpPrice = parseFloat(shoe.price);
        const cartCurrencyCode = cartWithCurrency.currency_code || 'PHP';
        
        // Always store the original PHP price
        const convertedPrice = phpPrice;

        // Check if item already exists in cart
        const existingItem = await ShoppingCartItem.query(trx).findOne({
          cart_id: cart.cart_id,
          shoe_id,
          shoe_us_size,
          shoe_branch_id: branch_id,
        });

        let cartItem;
        const inventory = await ShoeSizeInventory.query(trx).findOne({
          shoe_id,
          shoe_us_size,
          branch_id,
        });

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + quantity;

          // Check stock again for new quantity
          if (!inventory || inventory.stock < newQuantity) {
            throw {
              statusCode: 400,
              message: "Insufficient stock for requested quantity",
              available_stock: inventory?.stock || 0,
              current_cart_quantity: existingItem.quantity,
            };
          }

          cartItem = await ShoppingCartItem.query(trx).patchAndFetchById(
            existingItem.cart_item_id,
            {
              quantity: newQuantity,
              price_at_addition: convertedPrice,
            },
          );
        } else {
          // Add new item to cart
          cartItem = await ShoppingCartItem.query(trx).insert({
            cart_id: cart.cart_id,
            shoe_id,
            shoe_us_size,
            shoe_branch_id: branch_id,
            price_at_addition: convertedPrice,
            quantity,
          });
        }

        return cartItem;
      });

      // Fetch the complete cart item with relations
      const completeItem = await ShoppingCartItem.query()
        .findById(result.cart_item_id)
        .withGraphFetched("[shoe.[brand, images], inventory]");

      return res.status(201).json({
        message: "Item added to cart successfully",
        cart_item: {
          cart_item_id: completeItem.cart_item_id,
          shoe_id: completeItem.shoe_id,
          shoe_name: completeItem.shoe.name,
          brand_name: completeItem.shoe.brand.brand_name,
          shoe_image: completeItem.shoe.images?.[0]?.img_path || null,
          size: completeItem.shoe_us_size,
          quantity: completeItem.quantity,
          price: completeItem.price_at_addition,
          subtotal: completeItem.quantity * completeItem.price_at_addition,
          available_stock: completeItem.inventory?.stock || 0,
        },
      });
    } catch (err) {
      // Handle custom errors with statusCode
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          error: err.message,
          ...(err.available_stock !== undefined && { available_stock: err.available_stock }),
          ...(err.current_branch_id !== undefined && { current_branch_id: err.current_branch_id }),
          ...(err.current_cart_quantity !== undefined && {
            current_cart_quantity: err.current_cart_quantity,
          }),
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ error: "Failed to add item to cart" });
  }
};

/**
 * Update quantity of a cart item
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    // Find cart item and verify ownership
    const cartItem = await ShoppingCartItem.query()
      .findById(cartItemId)
      .withGraphFetched("[cart, inventory]");

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Verify cart belongs to user
    if (cartItem.cart.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check inventory
    if (!cartItem.inventory || cartItem.inventory.stock < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        available_stock: cartItem.inventory?.stock || 0,
      });
    }

    // Update quantity
    await ShoppingCartItem.query().patchAndFetchById(cartItemId, { quantity });

    return res.json({
      message: "Cart item updated successfully",
      cart_item_id: cartItemId,
      quantity,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ error: "Failed to update cart item" });
  }
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartItemId = parseInt(req.params.itemId);

    // Find cart item and verify ownership
    const cartItem = await ShoppingCartItem.query().findById(cartItemId).withGraphFetched("cart");

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Verify cart belongs to user
    if (cartItem.cart.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete cart item
    await ShoppingCartItem.query().deleteById(cartItemId);

    return res.json({
      message: "Item removed from cart successfully",
      cart_item_id: cartItemId,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

/**
 * Clear all items from the cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { cart_id } = req.params;

    let cartToUse = cart_id;

    // If no cart_id provided, find user's cart
    if (!cartToUse) {
      const cart = await ShoppingCart.query().findOne({ user_id: userId });
      if (!cart) {
        return res.json({ message: "Cart is already empty" });
      }
      cartToUse = cart.cart_id;
    } else {
      // Verify cart belongs to user
      const cart = await ShoppingCart.query().findById(cartToUse);
      if (!cart || cart.user_id !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    // Delete all items from cart
    await ShoppingCartItem.query().delete().where("cart_id", cartToUse);

    return res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ error: "Failed to clear cart" });
  }
};

/**
 * Get cart item count (for navbar badge)
 */
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const cart = await ShoppingCart.query().findOne({ user_id: userId }).withGraphFetched("items");

    if (!cart) {
      return res.json({ count: 0 });
    }

    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({ count });
  } catch (error) {
    console.error("Get cart count error:", error);
    return res.status(500).json({ error: "Failed to get cart count" });
  }
};
