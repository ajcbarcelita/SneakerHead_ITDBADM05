import { Model } from "objection";
import Shoe from "./Shoe.js";
import Branch from "./Branch.js";

export default class ShoeSizeInventory extends Model {
  static tableName = "shoe_size_inventory";
  static idColumn = ["shoe_id", "shoe_us_size", "branch_id"];

  static jsonSchema = {
    type: "object",
    required: ["shoe_id", "shoe_us_size", "branch_id", "stock"],
    properties: {
      shoe_id: { type: "integer" },
      shoe_us_size: { type: "number" },
      branch_id: { type: "integer" },
      stock: { type: "integer" },
    },
  };

  static relationMappings = {
    shoe: {
      relation: Model.BelongsToOneRelation,
      modelClass: Shoe,
      join: {
        from: "shoe_size_inventory.shoe_id",
        to: "shoes.shoe_id",
      },
    },
    branch: {
      relation: Model.BelongsToOneRelation,
      modelClass: Branch,
      join: {
        from: "shoe_size_inventory.branch_id",
        to: "branches.branch_id",
      },
    },
  };
}
