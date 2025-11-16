import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import OrderHistoryView from '../models/OrderHistoryView.js'

/**
 * Get order history for the logged-in user
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.user_id
    console.log('Getting order history for user_id:', userId)

    // Fetch all order items for the user from the view
    const items = await OrderHistoryView.query()
      .where('user_id', userId)
      .orderBy('order_created_at', 'desc')
      .orderBy('order_id', 'desc')

    console.log('Order items found:', items.length)

    // Format response data - map view fields to frontend expectations
    const formattedItems = items.map(item => ({
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
    }))

    return res.json(formattedItems)
  } catch (error) {
    console.error('Get order history error:', error)
    return res.status(500).json({ error: 'Failed to fetch order history' })
  }
}

/**
 * Get details of a specific order
 */
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.user_id
    const orderId = req.params.orderId
    console.log('Getting order details for order_id:', orderId, 'user_id:', userId)

    // Fetch order items for the specific order from the view
    const items = await OrderHistoryView.query()
      .where('user_id', userId)
      .where('order_id', orderId)

    if (!items || items.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Format response data
    const formattedItems = items.map(item => ({
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
    }))

    return res.json(formattedItems)
  } catch (error) {
    console.error('Get order details error:', error)
    return res.status(500).json({ error: 'Failed to fetch order details' })
  }
}
