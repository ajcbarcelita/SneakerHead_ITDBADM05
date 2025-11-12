import express from "express";
import getOrders from "../controllers/BMOrderController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(authenticateUser("Branch Manager"));

// Get all orders
router.get("/ManageOrders", getOrders);

export default router;