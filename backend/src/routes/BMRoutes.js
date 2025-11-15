import express from "express";
import { getOrders, getMetrics, getStocks, updateStock, getBranchAssignment } from "../controllers/BMController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Branch Manager";

// Get branch assignment for logged-in BM
router.get("/branch-assignment", authenticateUser(role), getBranchAssignment);

// Get all orders
router.get("/ManageOrders", authenticateUser(role), getOrders);

// Get BM metrics
router.get("/BMmetrics", authenticateUser(role), getMetrics);

// Get stock list for branch
router.get("/ManageStock", authenticateUser(role), getStocks);

// Update shoe sizes 
router.put("/ManageStock/:id", authenticateUser(role), updateStock);


export default router;
