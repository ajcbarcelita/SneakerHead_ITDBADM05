import { Model } from "objection";

export default class ShoeSize extends Model {
  static tableName = "ref_us_sizes";
  static idColumn = "shoe_size";

  static jsonSchema = {
    type: "object",
    required: ["shoe_size"],
    properties: {
      shoe_size: { type: "number" },
    },
  };
}