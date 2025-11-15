import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

/**
 * Get order history for the current user
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch all orders for the user with branch info
    const orders = await Order.query()
      .where("user_id", userId)
      .withGraphFetched("branch")
      .orderBy("created_at", "desc");

    // For each order, fetch the items with shoe details
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.query()
          .where("order_id", order.order_id)
          .withGraphFetched("[shoe.[brand, images]]");

        return {
          order_id: order.order_id,
          user_id: order.user_id,
          branch_id: order.branch_id,
          branch_name: order.branch?.branch_name || null,
          total_price: parseFloat(order.total_price),
          promo_code: order.promo_code,
          created_at: order.created_at,
          items_count: items.length,
          items: items.map((item) => ({
            order_item_id: item.order_item_id,
            order_id: item.order_id,
            shoe_id: item.shoe_id,
            shoe_size: item.shoe_us_size,
            branch_id: item.shoe_branch_id,
            quantity: item.quantity,
            price_at_purchase: parseFloat(item.price_at_purchase),
            subtotal: item.quantity * parseFloat(item.price_at_purchase),
            created_at: item.created_at,
            // Joined data from shoe relations
            shoe_name: item.shoe?.name,
            brand_name: item.shoe?.brand?.brand_name,
            shoe_image: item.shoe?.images?.[0]?.img_path || null,
          })),
        };
      })
    );

    return res.json(ordersWithItems);
  } catch (error) {
    console.error("Get order history error:", error);
    return res.status(500).json({ error: "Failed to fetch order history" });
  }
};

/**
 * Get a single order with items
 */
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { orderId } = req.params;

    // Fetch order and verify it belongs to the user
    const order = await Order.query()
      .findById(orderId)
      .withGraphFetched("branch");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized - Order does not belong to you" });
    }

    // Fetch order items with shoe details
    const items = await OrderItem.query()
      .where("order_id", orderId)
      .withGraphFetched("[shoe.[brand, images]]");

    const orderDetails = {
      order_id: order.order_id,
      user_id: order.user_id,
      branch_id: order.branch_id,
      branch_name: order.branch?.branch_name || null,
      total_price: parseFloat(order.total_price),
      promo_code: order.promo_code,
      created_at: order.created_at,
      items_count: items.length,
      items: items.map((item) => ({
        order_item_id: item.order_item_id,
        order_id: item.order_id,
        shoe_id: item.shoe_id,
        shoe_size: item.shoe_us_size,
        branch_id: item.shoe_branch_id,
        quantity: item.quantity,
        price_at_purchase: parseFloat(item.price_at_purchase),
        subtotal: item.quantity * parseFloat(item.price_at_purchase),
        created_at: item.created_at,
        shoe_name: item.shoe?.name,
        brand_name: item.shoe?.brand?.brand_name,
        shoe_image: item.shoe?.images?.[0]?.img_path || null,
      })),
    };

    return res.json(orderDetails);
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
};
