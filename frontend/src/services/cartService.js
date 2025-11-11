/**
 * Shopping Cart API Service
 * Handles all cart-related API calls
 */

import apiClient from './api.js'

const cartService = {
  /**
   * Get the current user's shopping cart
   * @returns {Promise} Cart data with items
   */
  async getCart() {
    try {
      const response = await apiClient.get('/cart')
      return response.data
    } catch (error) {
      console.error('Error fetching cart:', error)
      throw error
    }
  },

  /**
   * Get cart item count
   * @returns {Promise} Object with count property
   */
  async getCartCount() {
    try {
      const response = await apiClient.get('/cart/count')
      return response.data
    } catch (error) {
      console.error('Error fetching cart count:', error)
      throw error
    }
  },

  /**
   * Add an item to the cart
   * @param {Object} itemData - Item details
   * @param {number} itemData.shoe_id - Shoe ID
   * @param {number} itemData.shoe_us_size - US shoe size
   * @param {number} itemData.branch_id - Branch ID
   * @param {number} itemData.quantity - Quantity (default: 1)
   * @returns {Promise} Added cart item data
   */
  async addToCart(itemData) {
    try {
      const response = await apiClient.post('/cart/items', itemData)
      return response.data
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  },

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} Updated cart item data
   */
  async updateCartItem(cartItemId, quantity) {
    try {
      const response = await apiClient.put(`/cart/items/${cartItemId}`, { quantity })
      return response.data
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw error
    }
  },

  /**
   * Remove an item from the cart
   * @param {number} cartItemId - Cart item ID
   * @returns {Promise} Success message
   */
  async removeFromCart(cartItemId) {
    try {
      const response = await apiClient.delete(`/cart/items/${cartItemId}`)
      return response.data
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  },

  /**
   * Clear all items from the cart
   * @returns {Promise} Success message
   */
  async clearCart() {
    try {
      const response = await apiClient.delete('/cart')
      return response.data
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }
}

export default cartService
