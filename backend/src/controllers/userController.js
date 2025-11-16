import User from '../models/User.js'
import Address from '../models/Address.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

/**
 * Get user profile with address and location information
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id
    console.log('Getting profile for user_id:', userId)

    // Fetch user with address and role information
    const user = await User.query()
      .findById(userId)
      .withGraphFetched('[role, address.[city_municipality.province]]')

    console.log('User found:', user ? 'Yes' : 'No')
    if (user) {
      console.log('User has address:', user.address ? 'Yes' : 'No')
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Format response data
    const profileData = {
      user_id: user.user_id,
      email: user.email,
      fname: user.fname,
      mname: user.mname,
      lname: user.lname,
      role_name: user.role?.role_name || 'Customer',
      role_id: user.role_id,
      created_at: user.created_at,
      updated_at: user.updated_at,

      // Address information
      address_id: user.address_id,
      addressline1: user.address?.addressline1 || null,
      addressline2: user.address?.addressline2 || null,
      city_id: user.address?.city_id,
      city_name: user.address?.city_municipality?.city_name || null,
      province_id: user.address?.city_municipality?.province?.province_id,
      province_name: user.address?.city_municipality?.province?.province_name || null,
    }

    return res.json(profileData)
  } catch (error) {
    console.error('Get user profile error:', error)
    return res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

/**
 * Update user profile (name and address)
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { fname, mname, lname, addressline1, addressline2, city_id } = req.body

    // Validate required fields
    if (!fname || !lname) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    const knex = User.knex()

    // Use transaction for atomicity
    const result = await knex.transaction(async (trx) => {
      // Get current user to check if they have an address_id
      const currentUser = await User.query(trx).findById(userId)
      
      let addressId = currentUser.address_id
      
      // Update or create address if address data is provided
      if (addressId) {
        // Update existing address
        await Address.query(trx).patchAndFetchById(addressId, {
          addressline1: addressline1 || null,
          addressline2: addressline2 || null,
          city_id: city_id || null,
        })
      } else if (city_id || addressline1) {
        // Create new address if data provided and user doesn't have one
        const newAddress = await Address.query(trx).insert({
          addressline1: addressline1 || null,
          addressline2: addressline2 || null,
          city_id: city_id || null,
        })
        addressId = newAddress.address_id
      }

      // Update user profile
      await User.query(trx).patchAndFetchById(userId, {
        fname,
        mname: mname || null,
        lname,
        address_id: addressId,
        updated_at: new Date().toISOString(),
      })

      return { addressId }
    })

    // Fetch updated profile with relations
    const updatedProfile = await User.query()
      .findById(userId)
      .withGraphFetched('[role, address.[city_municipality.province]]')

    const profileData = {
      user_id: updatedProfile.user_id,
      email: updatedProfile.email,
      fname: updatedProfile.fname,
      mname: updatedProfile.mname,
      lname: updatedProfile.lname,
      role_name: updatedProfile.role?.role_name || 'Customer',
      role_id: updatedProfile.role_id,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
      address_id: updatedProfile.address_id,
      addressline1: updatedProfile.address?.addressline1 || null,
      addressline2: updatedProfile.address?.addressline2 || null,
      city_id: updatedProfile.address?.city_id,
      city_name: updatedProfile.address?.city_municipality?.city_name || null,
      province_id: updatedProfile.address?.city_municipality?.province?.province_id,
      province_name: updatedProfile.address?.city_municipality?.province?.province_name || null,
    }

    return res.json(profileData)
  } catch (error) {
    console.error('Update user profile error:', error)
    return res.status(500).json({ error: 'Failed to update user profile' })
  }
}

/**
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' })
    }

    // Fetch current user with password hash
    const user = await User.query().findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(user.pw_hash, currentPassword)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await User.query().patchAndFetchById(userId, {
      pw_hash: hashedNewPassword,
      updated_at: new Date().toISOString(),
    })

    return res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({ error: 'Failed to change password' })
  }
}
