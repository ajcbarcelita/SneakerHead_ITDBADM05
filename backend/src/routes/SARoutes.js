import express from "express";
import multer from "multer";
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
        getBrands,
        getCategories,
        getShoeById
} from "../controllers/ManageShoesController.js";
import { getLogs } from "../controllers/ViewLogsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

let role = "Admin";

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory for Cloudinary
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        fieldSize: 10 * 1024 * 1024 // 10MB for form fields
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// Route for fetching Admin dashboard metrics
router.get("/metrics", authenticateUser(role), metrics);

// Fetch all users
router.get("/users", authenticateUser(role), getUsers);

// Fetch all branches
router.get("/branches-admin", authenticateUser(role), getBranches);

// Fetch all cities
router.get("/cities", authenticateUser(role), getCities);

// Fetch all promo codes
router.get("/promo-codes", authenticateUser(role), getPromoCodes);

// Fetch all shoes
router.get("/shoes", authenticateUser(role), getShoes);

// Fetch all brands
router.get("/brands", authenticateUser(role), getBrands);

// Fetch all categories
router.get("/categories", authenticateUser(role), getCategories);

// Fetch all logs
router.get("/logs", authenticateUser(role), getLogs);

// Add a new user
router.post("/users", authenticateUser(role), addUser);

// Add a new branch
router.post("/branches-admin", authenticateUser(role), addBranch);

// Add a new promo code
router.post("/promo-codes", authenticateUser(role), addPromoCode);

// Add a new shoe - WITH MULTER FOR FILE UPLOADS
router.post("/shoes", authenticateUser(role), upload.array('images', 10), addShoe);

// Update branch
router.put("/branches-admin/:branchId", authenticateUser(role), updateBranch);

// Update user
router.put("/users/:userId", authenticateUser(role), updateUser);

// Update promo code
router.put("/promo-codes/:promoCode", authenticateUser(role), updatePromoCode);

// Update shoe
router.put("/shoes/:shoeId", authenticateUser(role), upload.array('images', 10), updateShoe);

// Get shoe by ID
router.get("/shoes/:shoeId", authenticateUser(role), getShoeById);

export default router;
