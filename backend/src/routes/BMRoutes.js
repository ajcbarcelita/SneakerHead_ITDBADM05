import express from "express";
import getOrders from "../controllers/BMOrderController.js";
// import { isAuthenticated } from "../middlewares/authMiddleware.js";
// import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All BM routes require authentication
// router.use(isAuthenticated);

// Get all orders
router.get("/ManageOrders", getOrders);


export default router;