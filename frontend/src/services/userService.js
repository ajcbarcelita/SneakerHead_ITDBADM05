/**
 * User Profile API Service
 * Handles all user-related API calls
 */

import apiClient from './api.js'

const userService = {
  /**
   * Get the current user's profile
   * @returns {Promise} User profile data with address and location info
   */
  async getUserProfile() {
    try {
      const response = await apiClient.get('/user/profile')
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  /**
   * Update user profile (name and address)
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Updated user profile
   */
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.put('/user/profile', profileData)
      return response.data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Success message
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/user/change-password', {
        currentPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

export default userService
