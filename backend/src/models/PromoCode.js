import { Model } from "objection";

export default class PromoCode extends Model {
  static tableName = "promo_codes";
  static idColumn = "promo_code";

  static jsonSchema = {
    type: "object",
    required: ["promo_code", "discount_type", "discount_value"],
    properties: {
      promo_code: { type: "string", maxLength: 12 },
      discount_type: { type: "string", enum: ["percentage", "fixed"] }, // Adjust enum values based on your actual options
      discount_value: { type: "number" },
      min_order_value: { type: ["number", "null"] },
      is_fmt_time_only: { type: ["boolean", "null"], default: false },
      start_date: { type: "string", format: "date" },
      end_date: { type: "string", format: "date" },
      used_count: { type: "integer", default: 0 },
      usage_limit: { type: ["integer", "null"] },
      is_active: { type: "boolean", default: true },
    },
  };
}
