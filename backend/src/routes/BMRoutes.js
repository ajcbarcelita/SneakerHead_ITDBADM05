import express from "express";
import getOrders from "../controllers/BMOrderController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

let role = "Branch Manager";

// Get all orders
router.get("/ManageOrders", authenticateUser(role), getOrders);

export default router;