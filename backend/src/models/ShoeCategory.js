import { Model } from "objection";

export default class ShoeCategory extends Model {
  static tableName = "shoe_categories";
  static idColumn = ["shoe_id", "shoe_category_id"];

  static jsonSchema = {
    type: "object",
    required: ["shoe_id", "shoe_category_id"],
    properties: {
      shoe_id: { type: "integer" },
      shoe_category_id: { type: "integer" },
    },
  };

  static relationMappings = {
    shoe: {
      relation: Model.BelongsToOneRelation,
      modelClass: () => require('./Shoe.js').default,
      join: {
        from: "shoe_categories.shoe_id",
        to: "shoes.shoe_id",
      },
    },
    category: {
      relation: Model.BelongsToOneRelation,
      modelClass: () => require('./RefShoeCategory.js').default,
      join: {
        from: "shoe_categories.shoe_category_id",
        to: "ref_shoe_categories.category_id",
      },
    },
  };
}