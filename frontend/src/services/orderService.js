/**
 * Order API Service
 * Handles all order-related API calls
 */

import apiClient from './api.js'

const orderService = {
  /**
   * Create a new order from shopping cart
   * @param {Object} orderData - Order data including cart_id, delivery_method, etc.
   * @returns {Promise} Order confirmation with order_id
   */
  async createOrder(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  /**
   * Get all orders for the current user
   * @returns {Promise} Array of user's orders
   */
  async getOrderHistory() {
    try {
      const response = await apiClient.get('/orders')
      return response.data
    } catch (error) {
      console.error('Error fetching order history:', error)
      throw error
    }
  },

  /**
   * Get details of a specific order
   * @param {number} orderId - Order ID
   * @returns {Promise} Order details with items
   */
  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order details:', error)
      throw error
    }
  },

  /**
   * Validate a promo code
   * @param {string} promoCode - The promo code to validate
   * @param {number} subtotal - Order subtotal for validation
   * @returns {Promise} Promo code details if valid
   */
  async validatePromoCode(promoCode, subtotal) {
    try {
      const response = await apiClient.post('/validate-promo', {
        promo_code: promoCode,
        subtotal: subtotal
      })
      return response.data
    } catch (error) {
      console.error('Error validating promo code:', error)
      throw error
    }
  }
}

export default orderService
