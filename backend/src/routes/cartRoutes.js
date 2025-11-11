import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";
// import { isAuthenticated } from "../middlewares/authMiddleware.js";
// import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
// router.use(isAuthenticated);

// Get user's cart
router.get("/cart", getCart);

// Get cart item count
router.get("/cart/count", getCartCount);

// Add item to cart
router.post("/cart/items", addToCart);

// Update cart item quantity
router.put("/cart/items/:itemId", updateCartItem);

// Remove item from cart
router.delete("/cart/items/:itemId", removeFromCart);

// Clear entire cart
router.delete("/cart", clearCart);

export default router;
