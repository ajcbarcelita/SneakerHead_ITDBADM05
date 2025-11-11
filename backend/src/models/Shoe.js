import { Model } from "objection";
import ShoeBrand from "./ShoeBrand.js";
import ShoeImage from "./ShoeImage.js";
import ShoeCategory from "./ShoeCategory.js";

export default class Shoe extends Model {
  static tableName = "shoes";
  static idColumn = "shoe_id";

  static jsonSchema = {
    type: "object",
    required: ["brand_id", "name", "price"],
    properties: {
      shoe_id: { type: "integer" },
      brand_id: { type: "integer" },
      name: { type: "string", maxLength: 50 },
      price: { type: "number" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      is_deleted: { type: "boolean", default: false },
    },
  };

  static relationMappings = {
    brand: {
      relation: Model.BelongsToOneRelation,
      modelClass: ShoeBrand,
      join: {
        from: "shoes.brand_id",
        to: "ref_shoe_brands.brand_id",
      },
    },
    images: {
      relation: Model.HasManyRelation,
      modelClass: ShoeImage,
      join: {
        from: "shoes.shoe_id",
        to: "shoe_images.shoe_id",
      },
    },
    categories: {
      relation: Model.ManyToManyRelation,
      modelClass: ShoeCategory,
      join: {
        from: "shoes.shoe_id",
        through: {
          from: "shoe_categories.shoe_id",
          to: "shoe_categories.shoe_category_id",
        },
        to: "ref_shoe_categories.category_id",
      },
    },
  };
}
