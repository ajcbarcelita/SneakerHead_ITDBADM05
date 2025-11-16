import { transaction } from "objection";
import Order from "../models/Order.js";
import Shoe from "../models/Shoe.js";
import BranchAdminAssignment from "../models/BranchAdminAssignment.js";
import { logEvent } from "../services/logEventService.js";

export async function getBranchAssignment(req, res) {
    try {
        const userId = req.user?.user_id;
        if (!userId) return res.status(401).json({ message: "Not authenticated" });

        const assignment = await BranchAdminAssignment
            .query()
            .where("staff_id", userId)
            .andWhere("unassigned_at", null)
            .withGraphFetched("branch")
            .first();

        if (!assignment) {
            return res.status(404).json({ message: "No branch assignment found" });
        }

        res.json({
            branchId: assignment.branch_id,
            branchName: assignment.branch.branch_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function getOrders(req, res) {
    try {
        const branch_id = req.query.branch_id || 1;
        const knex = Order.knex();  // Get Knex instance for transaction

        // Use transaction for read consistency (ACID - Isolation)
        // In here uses Isolation, only see the data that is already existing before the transaction starts
        const results = await transaction(knex, async (trx) => {
            const [rows] = await trx.raw('CALL get_branch_orders(?)', [branch_id]);
            return rows[0];
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

            // Bottom level: order_items (array)
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

export async function getStocks(req, res) {
    try {
        const branch_id = parseInt(req.query.branch_id);
        const knex = Shoe.knex();

        const results = await transaction(knex, async (trx) => {
            const [rows] = await trx.raw('CALL get_branch_stocks(?)', [branch_id]);
            return rows[0];
        });

        // Parse the sizes_json string into actual objects
        const formatted = results.map(shoe => ({
            id: shoe.id,
            name: shoe.name,
            price: parseFloat(shoe.price),
            category: shoe.category,
            image: shoe.image,
            sizes: shoe.sizes_json
                ? JSON.parse(`[${shoe.sizes_json}]`)
                : [],
            totalStock: shoe.sizes_json
                ? JSON.parse(`[${shoe.sizes_json}]`).reduce((sum, sz) => sum + sz.quantity, 0)
                : 0
        }));

        res.json({ success: true, data: formatted });
    } catch (err) {
        console.error("Error fetching stocks:", err);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve stocks",
            error: err.message
        });
    }
}

export async function updateStock(req, res) {
    const shoeId = Number(req.params.id);
    const branchId = Number(req.body?.branchId);
    const sizes = req.body?.sizes; // Array of { size, quantity }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || null;
    const userId = req.user?.user_id ?? null;
    const roleId = req.user?.role_id ?? null;

    const knex = Shoe.knex();

    try {
        // Validate input
        if (!shoeId || !branchId || !Array.isArray(sizes)) {
            return res.status(400).json({
                message: 'Invalid input: shoeId, branchId, and sizes array are required'
            });
        }

        // Convert sizes array to JSON string
        const sizesJson = JSON.stringify(sizes);
        // sizes = [ { size: '8', quantity: 10 }, { size: '9', quantity: 5 } ] for example

        // Call the stored procedure
        await knex.raw('CALL update_shoe_stock(?, ?, ?)', [shoeId, branchId, sizesJson]);


        await logEvent({
            user_id: userId,
            role_id: roleId,
            action: 'UPDATE_STOCK_SUCCESS',
            description: `Updated stock for shoe_id=${shoeId}, branch_id=${branchId}`,
            ip
        }).catch(() => { });

        return res.json({
            success: true,
            message: 'Stock updated successfully'
        });


    } catch (err) {
        await logEvent({
            user_id: userId,
            role_id: roleId,
            action: 'UPDATE_STOCK_FAILED',
            description: `Failed to update stock for shoe_id=${shoeId}: ${err.message}`,
            ip
        }).catch(() => { });

        console.error(err);
        return res.status(500).json({
            message: 'Failed to update stock',
            error: err.message
        });
    }



    export async function getMetrics(req, res) {

    }