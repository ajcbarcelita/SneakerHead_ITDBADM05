import { Model } from 'objection';

class ShoeSize extends Model {
  static get tableName() {
    return 'ref_us_sizes';
  }

  static get idColumn() {
    return 'shoe_size';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['shoe_size'],
      properties: {
        shoe_size: { type: 'number', minimum: 0 }
      }
    };
  }

  static get relationMappings() {
    const ShoeSizeInventory = require('./ShoeSizeInventory');
    const ShoppingCartItem = require('./ShoppingCartItem');
    const OrderItem = require('./OrderItem');

    return {
      inventories: {
        relation: Model.HasManyRelation,
        modelClass: ShoeSizeInventory,
        join: {
          from: 'ref_us_sizes.shoe_size',
          to: 'shoe_size_inventory.shoe_us_size'
        }
      },
      cartItems: {
        relation: Model.HasManyRelation,
        modelClass: ShoppingCartItem,
        join: {
          from: 'ref_us_sizes.shoe_size',
          to: 'shopping_cart_items.shoe_us_size'
        }
      },
      orderItems: {
        relation: Model.HasManyRelation,
        modelClass: OrderItem,
        join: {
          from: 'ref_us_sizes.shoe_size',
          to: 'order_items.shoe_size'
        }
      }
    };
  }
}

export default ShoeSize;