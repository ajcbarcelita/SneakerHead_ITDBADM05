import express from "express";
import { getOrders, getMetrics } from "../controllers/BMController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Branch Manager";


// Get all orders
router.get("/ManageOrders", authenticateUser(role),  getOrders);

// Get branch metrics
router.get("/BMmetrics", authenticateUser(role), getMetrics);

export default router;