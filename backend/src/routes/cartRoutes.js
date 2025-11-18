import express from "express";
import {
  getCartHandler,
  createCartForUserHandler,
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  updateCartCurrencyHandler
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart from a specific branch
router.get("/:branch_id", getCartHandler);

// Create cart for user at a specific EXISTING branch
router.post("/", createCartForUserHandler);

// Update cart currency, and/or conversion rate
router.put("/:cart_id/currency", updateCartCurrencyHandler);

// Get cart item count
router.get("/count", getCartCount);

// Get all items in cart - not implemented yet
router.get("/:cart_id/items", getCartItems);

// Add item to cart
router.post("/:cart_id/items", addToCart);

// Update cart item quantity
router.put("/items/:itemId", updateCartItem);

// Remove item from cart
router.delete("/items/:itemId", removeFromCart);

// Clear entire cart
router.delete("/:cart_id/items", clearCart);

export default router;
