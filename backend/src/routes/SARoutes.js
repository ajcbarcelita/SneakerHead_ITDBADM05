import express from "express";
import { metrics } from "../controllers/DashboardController.js";
import { getUsers, 
        getBranches, 
        updateUser, 
        getCities,
        addBranch,
        updateBranch,
        addUser
} from "../controllers/BranchManagementController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Admin";

// Route for fetching Admin dashboard metrics
router.get("/metrics", authenticateUser(role), metrics);

// Fetch all users
router.get("/users", authenticateUser(role), getUsers);

// Fetch all branches
router.get("/branches", authenticateUser(role), getBranches);

// Add a new user
router.post("/users", authenticateUser(role), addUser);

// Add a new branch
router.post("/branches", authenticateUser(role), addBranch);

// Update branch
router.put("/branches/:branchId", authenticateUser(role), updateBranch);

// Fetch all cities
router.get("/cities", authenticateUser(role), getCities);

// Update user
router.put("/users/:userId", authenticateUser(role), updateUser);

export default router;