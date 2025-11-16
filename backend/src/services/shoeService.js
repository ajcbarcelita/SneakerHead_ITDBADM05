import knex from "../db/knex.js";

// Get all shoes for a branch
export async function getShoesByBranch(branch_id) {
  const rows = await knex.raw("CALL getShoesByBranch(?)", [branch_id]);
  return rows[0];
}

// Get basic shoe info
export async function getBasicShoeInfo(shoe_id) {
  const rows = await knex.raw("CALL getBasicShoeInfo(?)", [shoe_id]);
  return rows[0][0];
}

// Get categories for a shoe
export async function getShoeCategories(shoe_id) {
  const rows = await knex.raw("CALL getShoeCategories(?)", [shoe_id]);
  return rows[0].map((row) => row.category_name);
}

// Get images for a shoe
export async function getShoeImages(shoe_id) {
  const rows = await knex.raw("CALL getShoeImages(?)", [shoe_id]);
  return rows[0].map((row) => row.img_path);
}

// Get sizes and stock for a shoe at a branch
export async function getShoeSizes(shoe_id, branch_id) {
  const rows = await knex.raw("CALL getShoeSizes(?, ?)", [shoe_id, branch_id]);
  return rows[0].map((row) => ({ size: row.size, stock: row.stock }));
}
