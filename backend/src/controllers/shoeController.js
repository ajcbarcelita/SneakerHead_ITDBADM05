import {
  getShoesByBranch,
  getBasicShoeInfo,
  getShoeCategories,
  getShoeImages,
  getShoeSizes,
} from "../services/shoeService.js";

import ShoeBrand from "../models/ShoeBrand.js";
import RefShoeCategory from "../models/RefShoeCategory.js";

// Get all shoes for a branch
export async function getShoesByBranchController(req, res) {
  try {
    const branch_id = parseInt(req.params.branch_id);
    if (isNaN(branch_id)) return res.status(400).json({ error: "Invalid branch ID" });

    let shoes = await getShoesByBranch(branch_id);
    
    if (Array.isArray(shoes) && Array.isArray(shoes[0])) {
      shoes = shoes[0];
    }

    // fetch categories too
    const shoesWithCategories = await Promise.all(
      shoes.map(async shoe => {
        const categories = await getShoeCategories(shoe.shoe_id);
        return { ...shoe, categories };
      })
    );

    // Return shoes + metadata (keep same structure as before)
    res.json(shoesWithCategories);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get shoes for branch" });
  }
}

// Get full shoe details for a specific branch
export async function getShoeDetailsController(req, res) {
  try {
    const shoe_id = parseInt(req.params.shoe_id);
    const branch_id = parseInt(req.params.branch_id);

    if (isNaN(shoe_id) || isNaN(branch_id)) {
      return res.status(400).json({ error: "Invalid shoe or branch ID" });
    }

    const info = await getBasicShoeInfo(shoe_id);
    if (!info) return res.status(404).json({ error: "Shoe not found" });

    const [categories, images, sizes] = await Promise.all([
      getShoeCategories(shoe_id),
      getShoeImages(shoe_id),
      getShoeSizes(shoe_id, branch_id),
    ]);

    res.json({ ...info, categories, images, sizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get shoe details" });
  }
}

export async function getBrandsController(req, res) {
  try {
    const brands = await ShoeBrand.query().orderBy("brand_id");

    const formatted = brands.map(b => ({
      label: b.brand_name,
      value: b.brand_id,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
}

export async function getCategoriesController(req, res) {
  try {
    const categories = await RefShoeCategory.query().orderBy("category_id");

    const formatted = categories.map(c => ({
      label: c.category_name,
      value: c.category_id,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
