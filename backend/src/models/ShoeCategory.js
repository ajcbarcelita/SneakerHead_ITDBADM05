import { Model } from "objection";

export default class ShoeCategory extends Model {
  static tableName = "ref_shoe_categories";
  static idColumn = "category_id";

  static jsonSchema = {
    type: "object",
    required: ["category_name"],
    properties: {
      category_id: { type: "integer" },
      category_name: { type: "string", maxLength: 50 },
    },
  };
}
