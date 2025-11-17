import {
  getShoesByBranch,
  getBasicShoeInfo,
  getShoeCategories,
  getShoeImages,
  getShoeSizes,
} from "../services/shoeService.js";

// Get all shoes for a branch
export async function getShoesByBranchController(req, res) {
  try {
    const branch_id = parseInt(req.params.branch_id);
    if (isNaN(branch_id)) return res.status(400).json({ error: "Invalid branch ID" });

    const shoes = await getShoesByBranch(branch_id);
    res.json(shoes);
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

