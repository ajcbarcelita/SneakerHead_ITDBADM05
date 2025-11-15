/**
 * Order API Service
 * Handles all order-related API calls
 */

import apiClient from './api.js'

const orderService = {
  /**
   * Get order history for the current user
   * @returns {Promise} Array of orders with items
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
  }
}

export default orderService
