import { Model } from "objection";

export default class RefShoeCategory extends Model {
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

  static relationMappings = {
    shoe_categories: {
      relation: Model.HasManyRelation,
      modelClass: () => require('./ShoeCategory.js').default,
      join: {
        from: "ref_shoe_categories.category_id",
        to: "shoe_categories.shoe_category_id",
      },
    },
  };
}