import express from "express";
import { metrics } from "../controllers/DashboardController.js";
import { getUsers, 
        getBranches, 
        updateUser, 
        getCities,
        addBranch,
        updateBranch,
        addUser
} from "../controllers/ManageBranchController.js";
import { getPromoCodes,
         addPromoCode,
         updatePromoCode
} from "../controllers/ManagePromoCodesController.js";
import { getShoes,
        addShoe,
        updateShoe,
        getBrands
} from "../controllers/ManageShoesController.js";
import { getLogs } from "../controllers/ViewLogsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Admin";

// Route for fetching Admin dashboard metrics
router.get("/metrics", authenticateUser(role), metrics);

// Fetch all users
router.get("/users", authenticateUser(role), getUsers);

// Fetch all branches
router.get("/branches", authenticateUser(role), getBranches);

// Fetch all cities
router.get("/cities", authenticateUser(role), getCities);

// Fetch all promo codes
router.get("/promo-codes", authenticateUser(role), getPromoCodes);

// Fetch all shoes
router.get("/shoes", authenticateUser(role), getShoes);

// Fetch all brands
router.get("/brands", authenticateUser(role), getBrands);

// Fetch all logs
router.get("/logs", authenticateUser(role), getLogs);

// Add a new user
router.post("/users", authenticateUser(role), addUser);

// Add a new branch
router.post("/branches", authenticateUser(role), addBranch);

// Add a new promo code
router.post("/promo-codes", authenticateUser(role), addPromoCode);

// Add a new shoe
router.post("/shoes", authenticateUser(role), addShoe)

// Update branch
router.put("/branches/:branchId", authenticateUser(role), updateBranch);

// Update user
router.put("/users/:userId", authenticateUser(role), updateUser);

// Update promo code
router.put("/promo-codes/:promoCode", authenticateUser(role), updatePromoCode);

// Update shoe
router.put("/shoes/:shoeId", authenticateUser(role), updateShoe);

export default router;
