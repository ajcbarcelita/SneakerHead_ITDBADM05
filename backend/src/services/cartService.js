import ShoppingCart from "../models/ShoppingCart.js";
import ShoppingCartItem from "../models/ShoppingCartItem.js";
import ShoeSizeInventory from "../models/ShoeSizeInventory.js";

/**
 * Validate if item can be added to cart (stock check)
 */
export async function validateCartItemStock(shoeId, size, branchId, requestedQuantity) {
  const inventory = await ShoeSizeInventory.query().findOne({
    shoe_id: shoeId,
    shoe_us_size: size,
    branch_id: branchId,
  });

  if (!inventory) {
    return { valid: false, error: "Item not available", availableStock: 0 };
  }

  if (inventory.stock < requestedQuantity) {
    return {
      valid: false,
      error: "Insufficient stock",
      availableStock: inventory.stock,
    };
  }

  return { valid: true, availableStock: inventory.stock };
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.quantity * item.price_at_addition;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalItems,
  };
}

/**
 * Check if all cart items have sufficient stock
 */
export async function validateCartStock(cartId) {
  const cartItems = await ShoppingCartItem.query()
    .where("cart_id", cartId)
    .withGraphFetched("inventory");

  const outOfStock = [];

  for (const item of cartItems) {
    if (!item.inventory || item.inventory.stock < item.quantity) {
      outOfStock.push({
        cart_item_id: item.cart_item_id,
        shoe_id: item.shoe_id,
        size: item.shoe_us_size,
        requested: item.quantity,
        available: item.inventory?.stock || 0,
      });
    }
  }

  return {
    valid: outOfStock.length === 0,
    outOfStock,
  };
}

/**
 * Get or create cart for user
 */
export async function getOrCreateCart(userId, branchId, trx = null) {
  const query = trx ? ShoppingCart.query(trx) : ShoppingCart.query();

  let cart = await query.findOne({ user_id: userId });

  if (!cart) {
    cart = await query.insert({
      user_id: userId,
      branch_id: branchId,
    });
  }

  return cart;
}

/**
 * Check if cart can accept items from a different branch
 */
export async function canSwitchBranch(userId, newBranchId) {
  const cart = await ShoppingCart.query().findOne({ user_id: userId }).withGraphFetched("items");

  if (!cart) {
    return { canSwitch: true };
  }

  if (cart.branch_id === newBranchId) {
    return { canSwitch: true };
  }

  if (cart.items && cart.items.length > 0) {
    return {
      canSwitch: false,
      error: "Cart contains items from a different branch",
      currentBranchId: cart.branch_id,
      itemCount: cart.items.length,
    };
  }

  return { canSwitch: true };
}
