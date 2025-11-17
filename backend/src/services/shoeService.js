import knex from "../db/db.js";

// Get all shoes for a branch
export async function getShoesByBranch(branch_id) {
  const rows = await knex.raw("CALL getShoesByBranch(?)", [branch_id]);
  return rows[0]; // returns array of shoes
}

// Get basic shoe info
export async function getBasicShoeInfo(shoe_id) {
  const rows = await knex.raw("CALL getBasicShoeInfo(?)", [shoe_id]);
  return rows[0][0] || null; // single object or null
}

// Get categories for a shoe
export async function getShoeCategories(shoe_id) {
  const rows = await knex.raw("CALL getShoeCategories(?)", [shoe_id]);
  const categories = rows[0][0].map(r => r.category_name); // <--- notice the extra [0]
  return categories;
}

// Get images for a shoe
export async function getShoeImages(shoe_id) {
  const rows = await knex.raw("CALL getShoeImages(?)", [shoe_id]);
  return rows[0][0].map(r => r.img_path); // extra [0]
}

// Get sizes
export async function getShoeSizes(shoe_id, branch_id) {
  const rows = await knex.raw("CALL getShoeSizes(?, ?)", [shoe_id, branch_id]);
  return rows[0][0].map(r => ({ size: r.size, stock: r.stock })); // extra [0]
}
