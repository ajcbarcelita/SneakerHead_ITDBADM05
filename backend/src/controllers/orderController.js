import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import PromoCode from '../models/PromoCode.js'

/**
 * Create a new order from shopping cart using stored procedure
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { cart_id, delivery_method, address_id, branch_id, promo_code } = req.body

    if (!cart_id || !delivery_method) {
      return res.status(400).json({ error: 'cart_id and delivery_method are required' })
    }

    // Validate delivery method
    if (!['delivery', 'pickup'].includes(delivery_method)) {
      return res.status(400).json({ error: 'delivery_method must be "delivery" or "pickup"' })
    }

    // Validate delivery method requirements
    if (delivery_method === 'delivery' && !address_id) {
      return res.status(400).json({ error: 'address_id is required for delivery' })
    }

    if (delivery_method === 'pickup' && !branch_id) {
      return res.status(400).json({ error: 'branch_id is required for pickup' })
    }

    // Get client IP address
    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0'

    // Call stored procedure
    const knex = Order.knex()
    const result = await knex.raw(
      'CALL checkout_cart(?, ?, ?, ?, @order_id)',
      [userId, cart_id, promo_code || null, clientIp]
    )

    // Get the output parameter value
    const orderIdResult = await knex.raw('SELECT @order_id as order_id')
    const orderId = orderIdResult[0][0].order_id

    if (!orderId) {
      return res.status(500).json({ error: 'Failed to create order - no order ID returned' })
    }

    // Fetch the created order
    const order = await Order.query()
      .findById(orderId)

    // Fetch order items
    const orderItems = await OrderItem.query()
      .where('order_id', orderId)

    return res.status(201).json({
      order_id: order.order_id,
      total_price: order.total_price,
      currency_code: order.currency_code,
      delivery_method: delivery_method,
      items: orderItems,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Create order error:', error)
    
    // Check if error is from stored procedure
    if (error.message && error.message.includes('45000')) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Failed to create order: ' + error.message })
  }
}

/**
 * Get order history for the logged-in user
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.user_id
    console.log('Getting order history for user_id:', userId)

    const knex = Order.knex()

    // Fetch all order items for the user from the view
    const items = await knex('order_history_view')
      .where('user_id', userId)
      .orderBy('order_created_at', 'desc')
      .orderBy('order_id', 'desc')

    console.log("Order items found:", items.length);

    // Format response data - map view fields to frontend expectations
    const formattedItems = items.map((item) => ({
      order_item_id: item.order_item_id,
      order_id: item.order_id,
      order_created_at: item.order_created_at,
      shoe_id: item.shoe_id,
      branch_name: item.branch_name,
      quantity: item.quantity,
      size: item.size,
      price_at_purchase: item.price_at_purchase,
      subtotal: item.subtotal,
      total_price: item.total_price,
      currency_code: item.currency_code || 'PHP',
      currency_rate_to_peso: item.currency_rate_to_peso || 1,
      promo_code: item.promo_code || null,
      shoe_name: item.shoe_name,
      brand_name: item.brand_name,
      image_url: item.image_path || null,
    }));

    return res.json(formattedItems);
  } catch (error) {
    console.error("Get order history error:", error);
    return res.status(500).json({ error: "Failed to fetch order history" });
  }
};

/**
 * Get details of a specific order
 */
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.user_id
    const orderId = req.params.orderId
    console.log('Getting order details for order_id:', orderId, 'user_id:', userId)

    const knex = Order.knex()

    // Fetch order items for the specific order from the view
    const items = await knex('order_history_view')
      .where('user_id', userId)
      .where('order_id', orderId)

    if (!items || items.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format response data
    const formattedItems = items.map((item) => ({
      order_item_id: item.order_item_id,
      order_id: item.order_id,
      order_created_at: item.order_created_at,
      shoe_id: item.shoe_id,
      branch_name: item.branch_name,
      quantity: item.quantity,
      size: item.size,
      price_at_purchase: item.price_at_purchase,
      subtotal: item.subtotal,
      total_price: item.total_price,
      promo_code: item.promo_code || null,
      shoe_name: item.shoe_name,
      brand_name: item.brand_name,
      image_url: item.image_path || null,
    }));

    return res.json(formattedItems);
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
};

/**
 * Validate a promo code
 */
export const validatePromoCode = async (req, res) => {
  try {
    const { promo_code, subtotal } = req.body

    if (!promo_code) {
      return res.status(400).json({ error: 'promo_code is required' })
    }

    // Find promo code in database
    const promoCodeObj = await PromoCode.query().findOne('promo_code', promo_code.toUpperCase())

    if (!promoCodeObj) {
      return res.status(400).json({ error: 'Invalid promo code' })
    }

    if (!promoCodeObj.is_active) {
      return res.status(400).json({ error: 'This promo code is no longer active' })
    }

    // Check date validity
    const now = new Date()
    const startDate = promoCodeObj.start_date ? new Date(promoCodeObj.start_date) : null
    const endDate = promoCodeObj.end_date ? new Date(promoCodeObj.end_date) : null

    if (startDate && now < startDate) {
      return res.status(400).json({ error: 'This promo code is not yet valid' })
    }

    if (endDate && now > endDate) {
      return res.status(400).json({ error: 'This promo code has expired' })
    }

    // Check usage limit
    if (promoCodeObj.usage_limit && promoCodeObj.used_count >= promoCodeObj.usage_limit) {
      return res.status(400).json({ error: 'This promo code has reached its usage limit' })
    }

    // Check minimum order value
    if (promoCodeObj.min_order_value && subtotal < promoCodeObj.min_order_value) {
      return res.status(400).json({ 
        error: `Minimum order value of ${promoCodeObj.min_order_value} required for this promo code` 
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (promoCodeObj.discount_type === 'PERCENT' || promoCodeObj.discount_type === 'percentage') {
      discountAmount = subtotal * (promoCodeObj.discount_value / 100)
    } else if (promoCodeObj.discount_type === 'FIXED' || promoCodeObj.discount_type === 'fixed') {
      discountAmount = promoCodeObj.discount_value
    }

    // Return promo code details
    res.json({
      promo_code: promoCodeObj.promo_code,
      discount_type: promoCodeObj.discount_type,
      discount_value: promoCodeObj.discount_value,
      discount_amount: discountAmount,
      is_valid: true
    })
  } catch (error) {
    console.error('Validate promo code error:', error)
    res.status(500).json({ error: 'Failed to validate promo code' })
  }
}
