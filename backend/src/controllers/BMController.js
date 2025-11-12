import { transaction } from "objection";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Shoe from "../models/Shoe.js";
import User from "../models/User.js";

export async function getOrders(req, res) {
    try {
        const branch_id = req.query.branch_id || 1;
        const knex = Order.knex();  // Get Knex instance for transaction

        // Use transaction for read consistency (ACID - Isolation)
        // In here uses Isolation, only see the data that is already existing before the transaction starts
        const results = await transaction(knex, async (trx) => {
            // Query the view to get orders from specific branch
            const [rows] = await trx.raw(`
                SELECT 
                    order_id,
                    full_name,
                    branch_id,
                    total_price,
                    promo_code,
                    created_at,
                    order_item_id,
                    name AS shoe_name,
                    img_path AS shoe_image,
                    shoe_size,
                    quantity,
                    subtotal,
                    brand_name
                FROM branch_orders_view
                WHERE branch_id = ?
                ORDER BY order_id DESC, order_item_id
            `, [branch_id]);

            return rows;
        });

        // Group by order_id and aggregate items under each order (order items)
        const ordersMap = new Map();

        // Top level: orders mismo
        for (const row of results) {
            if (!ordersMap.has(row.order_id)) {
                ordersMap.set(row.order_id, {
                    order_id: row.order_id,
                    full_name: row.full_name,
                    branch_id: row.branch_id,
                    total_price: parseFloat(row.total_price),
                    promo_code: row.promo_code,
                    created_at: row.created_at,
                    items: [] // to hold order items below
                });
            }

            // Bottom level: order items (array)
            // Add item if order_item_id exists 
            if (row.order_item_id) {
                // push item into the corresponding order's items array
                ordersMap.get(row.order_id).items.push({
                    shoe_name: row.shoe_name,
                    brand_name: row.brand_name,
                    shoe_image: row.shoe_image,
                    shoe_size: parseFloat(row.shoe_size),
                    quantity: row.quantity,
                    subtotal: parseFloat(row.subtotal),
                });
            }
        }

        // Convert map to array and amount of order items
        const formatted = Array.from(ordersMap.values()).map(order => ({
            ...order,
            items_count: order.items.length
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
    }
}


export async function getMetrics (req, res) {
  
}