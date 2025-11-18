import apiClient from './api.js'

const cartService = {
  /**
   * Get the user's cart for a specific branch
   */
  async getCart(branchId) {
    try { 
      const response = await apiClient.get(`/cart/${branchId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching cart:', error)
      throw error
    }
  },

  /**
   * Create a cart for a user at a specific branch + currency
   */
  async createCart({ branch_id, currency_code, currency_rate_to_peso }) {
    try {
      const response = await apiClient.post('/cart', {
        branch_id,
        currency_code,
        currency_rate_to_peso,
      })
      return response.data
    } catch (error) {
      console.error('Error creating cart:', error)
      throw error
    }
  },

  /**
   * Update cart currency (or just rate)
   */
  async updateCurrency(cartId, currency_code, currency_rate_to_peso) {
    try {
      const response = await apiClient.put(`/cart/${cartId}/currency`, {
        currency_code,
        currency_rate_to_peso,
      })
      return response.data
    } catch (error) {
      console.error('Error updating cart currency:', error)
      throw error
    }
  },

  /**
   * Get cart item count
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
   * Get cart items
   */
  async getCartItems(cartId) {
    try {
      const response = await apiClient.get(`/cart/${cartId}/items`)
      return response.data
    } catch (error) {
      console.error('Error fetching cart items:', error)
      throw error
    }
  },

  /**
   * Add to cart
   */
  async addToCart(itemData) {
    try {
      const response = await apiClient.post(`/cart/items`, itemData)
      return response.data
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId, quantity) {
    try {
      const response = await apiClient.put(`/cart/items/${cartItemId}`, { quantity })
      return response.data
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  },

  /**
   * Remove an item
   */
  async removeFromCart(cartItemId) {
    try {
      const response = await apiClient.delete(`/cart/items/${cartItemId}`)
      return response.data
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  },

  /**
   * Clear all cart items
   */
  async clearCart(cartId) {
    try {
      const response = await apiClient.delete(`/cart/${cartId}/items`)
      return response.data
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  },
}

export default cartService
