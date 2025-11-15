import express from "express";
import { metrics } from "../controllers/DashboardController.js";
import { getUsers, getBranches, updateUser } from "../controllers/BranchManagementController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Admin";

// Route for fetching Admin dashboard metrics
router.get("/metrics", authenticateUser(role), metrics);

// Fetch all users
router.get("/users", authenticateUser(role), getUsers);

// Fetch all branches
router.get("/branches", authenticateUser(role), getBranches);

// Update user
router.put("/users/:userId", authenticateUser(role), updateUser);

export default router;