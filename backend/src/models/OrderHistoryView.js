import { Model } from "objection";

export default class OrderHistoryView extends Model {
  static tableName = "order_history_view";
  static idColumn = "order_item_id";

  // Views are read-only
  static get modifiers() {
    return {
      defaultSelect(query) {
        query.select(
            'order_item_id',
            'order_id',
            'user_id',
            'branch_id',
            'shoe_id',
            'branch_name',
            'shoe_name',
            'brand_name',
            'quantity',
            'size',
            'price_at_purchase',
            'subtotal',
            'image_path',
            'order_created_at',
            'total_price',
            'promo_code',
            'image_path'
        );
      }
    };
  }
}
