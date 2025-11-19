import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import ShoppingCart from '../models/ShoppingCart.js'
import ShoppingCartItem from '../models/ShoppingCartItem.js'
import ShoeSizeInventory from '../models/ShoeSizeInventory.js'
import PromoCode from '../models/PromoCode.js'
import Address from '../models/Address.js'

/**
 * Create a new order from shopping cart
 */
export const createOrder = async (req, res) => {
  const trx = await Order.startTransaction()

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

    // Fetch cart with items
    const cart = await ShoppingCart.query(trx)
      .findById(cart_id)
      .withGraphFetched('cartItems.[shoe, shoeSizeInventory]')

    if (!cart) {
      await trx.rollback()
      return res.status(404).json({ error: 'Cart not found' })
    }

    if (cart.user_id !== userId) {
      await trx.rollback()
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (!cart.cartItems || cart.cartItems.length === 0) {
      await trx.rollback()
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Validate delivery method requirements
    if (delivery_method === 'delivery' && !address_id) {
      await trx.rollback()
      return res.status(400).json({ error: 'address_id is required for delivery' })
    }

    if (delivery_method === 'pickup' && !branch_id) {
      await trx.rollback()
      return res.status(400).json({ error: 'branch_id is required for pickup' })
    }

    // Validate and apply promo code if provided
    let promoDiscount = 0
    let promoCodeObj = null
    if (promo_code) {
      promoCodeObj = await PromoCode.query(trx).findOne('promo_code', promo_code.toUpperCase())

      if (!promoCodeObj || !promoCodeObj.is_active) {
        await trx.rollback()
        return res.status(400).json({ error: 'Invalid or inactive promo code' })
      }

      // Calculate discount based on discount_type
      if (promoCodeObj.discount_type === 'PERCENT' || promoCodeObj.discount_type === 'percentage') {
        promoDiscount = promoCodeObj.discount_value // Already a percentage value (e.g., 10 for 10%)
      } else if (promoCodeObj.discount_type === 'FIXED' || promoCodeObj.discount_type === 'fixed') {
        // For fixed discounts, we need to calculate percentage of subtotal
        promoDiscount = (promoCodeObj.discount_value / cart.subtotal) * 100
      }
    }

    // Validate stock for all items
    for (const cartItem of cart.cartItems) {
      const inventory = await ShoeSizeInventory.query(trx)
        .where('shoe_id', cartItem.shoe_id)
        .where('shoe_us_size', cartItem.shoe_us_size)
        .where('branch_id', cart.branch_id)
        .first()

      if (!inventory || inventory.quantity < cartItem.quantity) {
        await trx.rollback()
        return res.status(400).json({
          error: `Insufficient stock for ${cartItem.shoe.shoe_name} size ${cartItem.shoe_us_size}`
        })
      }
    }

    // Calculate order total with currency conversion
    let totalPrice = cart.subtotal
    let totalPriceConversion = cart.subtotal

    if (promoDiscount > 0) {
      totalPrice = totalPrice * (1 - promoDiscount / 100)
      totalPriceConversion = totalPriceConversion * (1 - promoDiscount / 100)
    }

    // Determine order branch
    const orderBranchId = delivery_method === 'pickup' ? branch_id : cart.branch_id

    // Create order
    const order = await Order.query(trx).insert({
      user_id: userId,
      branch_id: orderBranchId,
      promo_code: promo_code || null,
      total_price: totalPrice,
      currency_code: cart.currency_code,
      currency_rate_to_peso: cart.currency_rate_to_peso,
      total_price_conversion: totalPriceConversion,
      delivery_method: delivery_method,
      address_id: delivery_method === 'delivery' ? address_id : null,
      created_at: new Date()
    })

    // Create order items and deduct inventory
    const orderItems = []
    for (const cartItem of cart.cartItems) {
      const orderItem = await OrderItem.query(trx).insert({
        order_id: order.order_id,
        shoe_id: cartItem.shoe_id,
        shoe_size: cartItem.shoe_us_size,
        branch_id: cart.branch_id,
        quantity: cartItem.quantity,
        price_at_purchase: cartItem.price,
        subtotal: cartItem.subtotal
      })

      orderItems.push(orderItem)

      // Deduct inventory
      await ShoeSizeInventory.query(trx)
        .where('shoe_id', cartItem.shoe_id)
        .where('shoe_us_size', cartItem.shoe_us_size)
        .where('branch_id', cart.branch_id)
        .decrement('quantity', cartItem.quantity)
    }

    // Clear shopping cart
    await ShoppingCartItem.query(trx).where('cart_id', cart_id).delete()
    await ShoppingCart.query(trx).findById(cart_id).delete()

    // Increment promo code usage count if used
    if (promoCodeObj) {
      await PromoCode.query(trx)
        .findById(promo_code.toUpperCase())
        .increment('used_count', 1)
    }

    await trx.commit()

    return res.status(201).json({
      order_id: order.order_id,
      total_price: order.total_price,
      currency_code: order.currency_code,
      delivery_method: order.delivery_method,
      items: orderItems,
      message: 'Order created successfully'
    })
  } catch (error) {
    await trx.rollback()
    console.error('Create order error:', error)
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
