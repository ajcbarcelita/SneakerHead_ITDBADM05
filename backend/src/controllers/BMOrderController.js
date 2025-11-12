import Order from "../models/Order.js";
import { transaction } from "objection";

export default async function getOrders(req, res) {
  try {
    const branch_id = req.query.branch_id || 1;
    const knex = Order.knex(); // Get Knex instance for transaction

    // Knex / ACID might not be needed since read operation siya pero why not for read consistency
    const orders = await transaction(knex, async (trx) => {
      return await Order.query(trx)
        .withGraphFetched("[user, branch, promoCode, orderItems.[shoe.[brand]]]")
        .modifyGraph("user", (builder) => {
          builder.select("user_id", "fname", "lname");
        })
        .modifyGraph("promoCode", (builder) => {
          builder.select("promo_code");
        })
        .modifyGraph("branch", (builder) => {
          builder.select("branch_id", "branch_name");
        })
        .modifyGraph("orderItems.shoe.brand", (builder) => {
          builder.select("brand_id", "brand_name");
        })
        .where((builder) => {
          if (branch_id) builder.where("orders.branch_id", branch_id);
        });
    });

    // Format response for frontend table
    const formatted = orders.map((order) => ({
      order_id: order.order_id,
      full_name: `${order.user.fname} ${order.user.lname}`,
      branch_id: order.branch_id,
      total_price: order.total_price,
      items_count: order.orderItems ? order.orderItems.length : 0,
      promo_code: order.promoCode ? order.promoCode.promo_code : null,
      created_at: order.created_at,
      items: order.orderItems?.map((item) => ({
        shoe_name: item.shoe?.shoe_name,
        brand_name: item.shoe?.brand?.brand_name,
        shoe_image: item.shoe?.shoe_image,
        shoe_size: item.shoe_size,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
}
