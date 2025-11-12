import express from "express";
import { metrics } from "../controllers/DashboardController.js";
import { getUsers, getBranches } from "../controllers/BranchManagementController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Admin";

// Route for fetching Admin dashboard metrics
router.get("/metrics", authenticateUser(role), metrics);

// Fetch all users
router.get("/getUsers",  authenticateUser(role), getUsers);

// Fetch all branches
router.get("/getBranches", authenticateUser(role), getBranches);

// router.put("/users/:userId/role", authenticateUser(role), async (req, res) => {

export default router;