import express from "express";
import { getShoesByBranchController, getShoeDetailsController, getBrandsController, getCategoriesController } from "../controllers/shoeController.js";

const router = express.Router();

router.get("/brands", getBrandsController);
router.get("/categories", getCategoriesController);

// Get all shoes available at a branch
router.get("/branch/:branch_id", getShoesByBranchController);

// Get full shoe details (with sizes for a branch)
router.get("/:shoe_id/branch/:branch_id", getShoeDetailsController);

export default router;
