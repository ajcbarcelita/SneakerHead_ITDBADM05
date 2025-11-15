import express from "express";
import { getOrderHistory, getOrderDetails } from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

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
