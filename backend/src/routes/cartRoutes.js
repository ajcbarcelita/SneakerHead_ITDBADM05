import express from "express";
import {
  getCartHandler,
  createCartForUserHandler,
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

// Specific routes first to avoid wildcard conflicts
// Get cart item count
router.get("/count", getCartCount);

// Create cart for user at a specific EXISTING branch
router.post("/", createCartForUserHandler);

// Add item to cart
router.post("/items", addToCart);

// Update cart item quantity
router.put("/items/:itemId", updateCartItem);

// Remove item from cart
router.delete("/items/:itemId", removeFromCart);

// Update cart currency, and/or conversion rate
router.put("/:cart_id/currency", updateCartCurrencyHandler);

// Clear entire cart
router.delete("/:cart_id/items", clearCart);

// Get user's cart from a specific branch (wildcard - must be last)
router.get("/:branch_id", getCartHandler);

export default router;
