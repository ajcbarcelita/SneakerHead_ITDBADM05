import { Model } from "objection";

export default class ShoeBrand extends Model {
  static tableName = "ref_shoe_brands";
  static idColumn = "brand_id";

  static jsonSchema = {
    type: "object",
    required: ["brand_name"],
    properties: {
      brand_id: { type: "integer" },
      brand_name: { type: "string", maxLength: 50 },
    },
  };
}
