import { Model } from "objection";
import User from "./User.js";
import Branch from "./Branch.js";
import ShoppingCartItem from "./ShoppingCartItem.js";

export default class ShoppingCart extends Model {
  static tableName = "shopping_cart";
  static idColumn = "cart_id";

  static jsonSchema = {
    type: "object",
    required: ["user_id", "branch_id"],
    properties: {
      cart_id: { type: "integer" },
      user_id: { type: "integer" },
      branch_id: { type: "integer" },
    },
  };

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "shopping_cart.user_id",
          to: "users.user_id",
        },
      },
      branch: {
        relation: Model.BelongsToOneRelation,
        modelClass: Branch,
        join: {
          from: "shopping_cart.branch_id",
          to: "branches.branch_id",
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: ShoppingCartItem,
        join: {
          from: "shopping_cart.cart_id",
          to: "shopping_cart_items.cart_id",
        },
      },
    };
  }
}
