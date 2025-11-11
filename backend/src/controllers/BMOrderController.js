import Order from "../models/Order.js";

export default async function getOrders(req, res) {
    try {
        // Optional query parameter if you want to filter by branch_id
        const branch_id = req.query.branch_id || 1;

        // Fetch orders + relations
        const orders = await Order.query()
            .withGraphFetched("[user, branch, promoCode, orderItems.[shoe.[brand]]]")  // ← Change 'items' to 'orderItems'
            .modifyGraph("user", (builder) => {
                builder.select("user_id", "first_name", "last_name");
            })
            .modifyGraph("promoCode", (builder) => {
                builder.select("promo_code", "discount_percent");
            })
            .modifyGraph("branch", (builder) => {
                builder.select("branch_id", "branch_name");
            })
            .modifyGraph("orderItems.shoe.brand", (builder) => {  // ← Change 'items.shoe.brand' to 'orderItems.shoe.brand'
                builder.select("brand_id", "brand_name");
            })
            .where((builder) => {
                if (branch_id) builder.where("orders.branch_id", branch_id);
            });

        // Format response for frontend table
        const formatted = orders.map((order) => ({
            order_id: order.order_id,
            full_name: `${order.user.first_name} ${order.user.last_name}`,
            branch_id: order.branch_id,
            total_price: order.total_price,
            items_count: order.orderItems ? order.orderItems.length : 0,  // ← Change 'order.items' to 'order.orderItems'
            promo_code: order.promoCode ? order.promoCode.promo_code : null,  // ← Change 'order.promo_code' to 'order.promoCode'
            created_at: order.created_at,
            items: order.orderItems?.map((item) => ({  // ← Already correct, but ensure consistency
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