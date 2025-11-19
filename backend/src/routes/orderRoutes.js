import express from "express";
import { createOrder, getOrderHistory, getOrderDetails } from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * POST /orders
 * Create a new order from shopping cart
 * Requires: JWT token
 * Body: {
 *   cart_id: number,
 *   delivery_method: 'delivery' | 'pickup',
 *   address_id?: number (required for delivery),
 *   branch_id?: number (required for pickup),
 *   promo_code?: string
 * }
 */
router.post("/orders", authenticate, createOrder);

/**
 * GET /orders
 * Get order history for the logged-in user
 * Requires: JWT token
 */
router.get("/orders", authenticate, getOrderHistory);

/**
 * GET /orders/:orderId
 * Get details of a specific order
 * Requires: JWT token
 */
router.get("/orders/:orderId", authenticate, getOrderDetails);

export default router;
