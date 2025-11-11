import { Model } from "objection";

export default class ShoeImage extends Model {
  static tableName = "shoe_images";
  static idColumn = "img_id";

  static jsonSchema = {
    type: "object",
    required: ["shoe_id", "img_path"],
    properties: {
      img_id: { type: "integer" },
      shoe_id: { type: "integer" },
      img_path: { type: "string", maxLength: 255 },
    },
  };
}
