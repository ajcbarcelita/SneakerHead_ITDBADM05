import api from './api.js'

/**
 * Get current user's profile information
 */
export async function getUserProfile() {
  const res = await api.get('/user/profile')
  return res.data
}

/**
 * Update current user's profile information
 */
export async function updateUserProfile(profileData) {
  const res = await api.put('/user/profile', profileData)
  return res.data
}

/**
 * Change current user's password
 */
export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/user/change-password', {
    currentPassword,
    newPassword,
  })
  return res.data
}

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
}
