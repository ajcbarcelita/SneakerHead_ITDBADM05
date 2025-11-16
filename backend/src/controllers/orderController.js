import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'

/**
 * Get order history for the logged-in user
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.user_id
    console.log('Getting order history for user_id:', userId)

    // Fetch all orders for the user with order items and shoe details
    const orders = await Order.query()
      .where('user_id', userId)
      .withGraphFetched('[orderItems.[shoe.[brand, images]]]')
      .orderBy('created_at', 'desc')

    console.log('Orders found:', orders.length)

    // Format response data
    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      branch_id: order.branch_id,
      branch_name: order.branch_name,
      promo_code: order.promo_code || null,
      discount_amount: order.discount_amount || 0,
      total_price: order.total_price,
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_address,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.orderItems?.map(item => ({
        order_item_id: item.order_item_id,
        order_id: item.order_id,
        shoe_id: item.shoe_id,
        quantity: item.quantity,
        size: item.shoe_size,
        price_at_purchase: item.price_at_purchase,
        shoe_name: item.shoe?.name,
        brand_name: item.shoe?.brand?.brand_name,
        image_url: item.shoe?.images?.[0]?.image_url || null,
      })) || [],
    }))

    return res.json(formattedOrders)
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

    // Fetch specific order with all details
    const order = await Order.query()
      .findById(orderId)
      .withGraphFetched('[orderItems.[shoe.[brand, images]]]')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Verify that the order belongs to the logged-in user
    if (order.user_id !== userId) {
      console.log('Unauthorized: Order belongs to different user')
      return res.status(403).json({ error: 'Unauthorized - Cannot access this order' })
    }

    // Format response data
    const formattedOrder = {
      order_id: order.order_id,
      user_id: order.user_id,
      branch_id: order.branch_id,
      branch_name: order.branch_name,
      promo_code: order.promo_code || null,
      discount_amount: order.discount_amount || 0,
      total_price: order.total_price,
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_address,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.orderItems?.map(item => ({
        order_item_id: item.order_item_id,
        order_id: item.order_id,
        shoe_id: item.shoe_id,
        quantity: item.quantity,
        size: item.shoe_size,
        price_at_purchase: item.price_at_purchase,
        shoe_name: item.shoe?.name,
        brand_name: item.shoe?.brand?.brand_name,
        image_url: item.shoe?.images?.[0]?.image_url || null,
      })) || [],
    }

    return res.json(formattedOrder)
  } catch (error) {
    console.error('Get order details error:', error)
    return res.status(500).json({ error: 'Failed to fetch order details' })
  }
}
