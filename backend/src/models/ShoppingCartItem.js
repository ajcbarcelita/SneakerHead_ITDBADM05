import { Model } from "objection";
import ShoppingCart from "./ShoppingCart.js";
import Shoe from "./Shoe.js";
import ShoeSizeInventory from "./ShoeSizeInventory.js";

export default class ShoppingCartItem extends Model {
  static tableName = "shopping_cart_items";
  static idColumn = "cart_item_id";

  static jsonSchema = {
    type: "object",
    required: [
      "cart_id",
      "shoe_id",
      "shoe_us_size",
      "shoe_branch_id",
      "price_at_addition",
      "quantity",
    ],
    properties: {
      cart_item_id: { type: "integer" },
      cart_id: { type: "integer" },
      shoe_id: { type: "integer" },
      shoe_us_size: { type: "number" },
      shoe_branch_id: { type: "integer" },
      price_at_addition: { type: "number" },
      quantity: { type: "integer" },
      added_at: { type: "string", format: "date-time" },
    },
  };

  static get relationMappings() {
    return {
      cart: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShoppingCart,
        join: {
          from: "shopping_cart_items.cart_id",
          to: "shopping_cart.cart_id",
        },
      },
      shoe: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shoe,
        join: {
          from: "shopping_cart_items.shoe_id",
          to: "shoes.shoe_id",
        },
      },
      inventory: {
        relation: Model.HasOneRelation,
        modelClass: ShoeSizeInventory,
        join: {
          from: [
            "shopping_cart_items.shoe_id",
            "shopping_cart_items.shoe_us_size",
            "shopping_cart_items.shoe_branch_id",
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
}
