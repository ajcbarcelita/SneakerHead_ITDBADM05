import { Model } from "objection";
import User from "./User.js";
import Branch from "./Branch.js";
import PromoCode from "./PromoCode.js";
import OrderItem from "./OrderItem.js";

export default class Order extends Model {
  static tableName = "orders";
  static idColumn = "order_id";

  static jsonSchema = {
    type: "object",
    required: ["user_id", "branch_id", "total_price"],
    properties: {
      order_id: { type: "integer" },
      user_id: { type: "integer" },
      branch_id: { type: "integer" },
      total_price: { type: "number" },
      promo_code: { type: ["string", "null"], maxLength: 12 },
      created_at: { type: "string", format: "date-time" },
    },
  };

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: "orders.user_id",
        to: "users.user_id",
      },
    },
    branch: {
      relation: Model.BelongsToOneRelation,
      modelClass: Branch,
      join: {
        from: "orders.branch_id",
        to: "branches.branch_id",
      },
    },
    promoCode: {
      relation: Model.BelongsToOneRelation,
      modelClass: PromoCode,
      join: {
        from: "orders.promo_code",
        to: "promo_codes.promo_code",
      },
    },
    orderItems: {
      relation: Model.HasManyRelation,
      modelClass: OrderItem,
      join: {
        from: "orders.order_id",
        to: "order_items.order_id",
      },
    },
  };
}
