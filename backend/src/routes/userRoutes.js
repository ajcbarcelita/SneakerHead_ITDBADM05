import express from 'express'
import { getUserProfile, updateUserProfile, changePassword } from '../controllers/userController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * GET /user/profile
 * Get current user's profile
 * Requires: JWT token
 */
router.get('/user/profile', authenticate, getUserProfile)

/**
 * PUT /user/profile
 * Update user profile (name and address)
 * Requires: JWT token
 */
router.put('/user/profile', authenticate, updateUserProfile)

/**
 * POST /user/change-password
 * Change user password
 * Requires: JWT token
 */
router.post('/user/change-password', authenticate, changePassword)

export default router
