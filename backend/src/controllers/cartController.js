import ShoppingCart from "../models/ShoppingCart.js";
import ShoppingCartItem from "../models/ShoppingCartItem.js";
import ShoeSizeInventory from "../models/ShoeSizeInventory.js";
import Shoe from "../models/Shoe.js";
import { transaction } from "objection";

/**
 * Get the current user's shopping cart with all items
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find cart for user with all related data
    let cart = await ShoppingCart.query()
      .findOne({ user_id: userId })
      .withGraphFetched("[items.[shoe.[brand, images], inventory], branch]");

    // If no cart exists, return empty cart structure
    if (!cart) {
      return res.json({
        cart_id: null,
        branch_id: null,
        branch_name: null,
        items: [],
        subtotal: 0,
        total_items: 0,
      });
    }

    // Process cart items and calculate totals
    const processedItems = cart.items.map((item) => ({
      cart_item_id: item.cart_item_id,
      shoe_id: item.shoe_id,
      shoe_name: item.shoe.name,
      brand_name: item.shoe.brand.brand_name,
      shoe_image: item.shoe.images?.[0]?.img_path || null,
      size: item.shoe_us_size,
      quantity: item.quantity,
      price: item.price_at_addition,
      current_price: item.shoe.price,
      subtotal: item.quantity * item.price_at_addition,
      available_stock: item.inventory?.stock || 0,
      is_in_stock: (item.inventory?.stock || 0) >= item.quantity,
      branch_id: item.shoe_branch_id,
    }));

    const cartData = {
      cart_id: cart.cart_id,
      branch_id: cart.branch_id,
      branch_name: cart.branch?.branch_name || null,
      items: processedItems,
      subtotal: processedItems.reduce((sum, item) => sum + item.subtotal, 0),
      total_items: processedItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    return res.json(cartData);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
};

/**
 * Add an item to the shopping cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { shoe_id, shoe_us_size, branch_id, quantity = 1 } = req.body;

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
        // Check if shoe exists and get current price
        const shoe = await Shoe.query(trx).findById(shoe_id).where("is_deleted", false);

        if (!shoe) {
          throw { statusCode: 404, message: "Shoe not found" };
        }

        // Check inventory availability
        const inventory = await ShoeSizeInventory.query(trx).findOne({
          shoe_id,
          shoe_us_size,
          branch_id,
        });

        if (!inventory || inventory.stock < quantity) {
          throw {
            statusCode: 400,
            message: "Insufficient stock",
            available_stock: inventory?.stock || 0,
          };
        }

        // Find or create cart for user
        let cart = await ShoppingCart.query(trx).findOne({ user_id: userId });

        if (!cart) {
          cart = await ShoppingCart.query(trx).insert({
            user_id: userId,
            branch_id: branch_id,
          });
        } else if (cart.branch_id !== branch_id) {
          // If cart exists but for different branch, need to handle
          throw {
            statusCode: 400,
            message:
              "Cart already contains items from a different branch. Please clear your cart first.",
            current_branch_id: cart.branch_id,
          };
        }

        // Check if item already exists in cart
        const existingItem = await ShoppingCartItem.query(trx).findOne({
          cart_id: cart.cart_id,
          shoe_id,
          shoe_us_size,
          shoe_branch_id: branch_id,
        });

        let cartItem;

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + quantity;

          // Check stock again for new quantity
          if (inventory.stock < newQuantity) {
            throw {
              statusCode: 400,
              message: "Insufficient stock for requested quantity",
              available_stock: inventory.stock,
              current_cart_quantity: existingItem.quantity,
            };
          }

          cartItem = await ShoppingCartItem.query(trx).patchAndFetchById(
            existingItem.cart_item_id,
            {
              quantity: newQuantity,
              price_at_addition: parseFloat(shoe.price), // Update to current price
            },
          );
        } else {
          // Add new item to cart
          cartItem = await ShoppingCartItem.query(trx).insert({
            cart_id: cart.cart_id,
            shoe_id,
            shoe_us_size,
            shoe_branch_id: branch_id,
            price_at_addition: parseFloat(shoe.price),
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

    // Find user's cart
    const cart = await ShoppingCart.query().findOne({ user_id: userId });

    if (!cart) {
      return res.json({ message: "Cart is already empty" });
    }

    // Delete all items from cart
    await ShoppingCartItem.query().delete().where("cart_id", cart.cart_id);

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
