import { Model } from "objection";
import Order from "./Order.js";
import Shoe from "./Shoe.js";
import ShoeSizeInventory from "./ShoeSizeInventory.js";

export default class OrderItem extends Model {
  static tableName = "order_items";
  static idColumn = "order_item_id";

  static jsonSchema = {
    type: "object",
    required: [
      "order_id",
      "shoe_id",
      "shoe_size",
      "branch_id",
      "quantity",
      "price_at_purchase",
      "subtotal"
    ],
    properties: {
      order_item_id: { type: "integer" },
      order_id: { type: "integer" },
      shoe_id: { type: "integer" },
      shoe_size: { type: "number" },
      branch_id: { type: "integer" },
      quantity: { type: "integer" },
      price_at_purchase: { type: "number" },
      subtotal: { type: "number" },
      created_at: { type: "string", format: "date-time" },
    },
  };

  static relationMappings = {
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Order,
      join: {
        from: "order_items.order_id",
        to: "orders.order_id",
      },
    },
    shoe: {
      relation: Model.BelongsToOneRelation,
      modelClass: Shoe,
      join: {
        from: "order_items.shoe_id",
        to: "shoes.shoe_id",
      },
    },
    shoeSizeInventory: {
      relation: Model.BelongsToOneRelation,
      modelClass: ShoeSizeInventory,
      join: {
        from: [
          "order_items.shoe_id",
          "order_items.shoe_size",
          "order_items.branch_id",
        ],
        to: [
          "shoe_size_inventory.shoe_id",
          "shoe_size_inventory.shoe_us_size",
          "shoe_size_inventory.branch_id",
        ],
      },
    },
  };
}
