import User from "../models/User.js";
import Address from "../models/Address.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

/**
 * Get user profile with address and location information using database view
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id

    const knex = User.knex()

    // Fetch user profile from view
    const userProfile = await knex('user_details_view')
      .where('user_id', userId)
      .first()

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Format response data from view
    const profileData = {
      user_id: userProfile.user_id,
      email: userProfile.email,
      fname: userProfile.fname,
      mname: userProfile.mname,
      lname: userProfile.lname,
      role_name: userProfile.role_name || 'Customer',
      role_id: userProfile.role_id,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,

      // Address information
      address_id: userProfile.address_id,
      addressline1: userProfile.addressline1 || null,
      addressline2: userProfile.addressline2 || null,
      city_id: userProfile.city_id,
      city_name: userProfile.city_name || null,
      province_id: userProfile.province_id,
      province_name: userProfile.province_name || null,
    }

    return res.json(profileData);
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

/**
 * Update user profile (name and address) using stored procedure
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || null
    const { fname, mname, lname, email, addressline1, addressline2, province_id, city_id } = req.body

    // Validate required fields
    if (!fname || !lname) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    const knex = User.knex();

    // Call the stored procedure
    await knex.raw('CALL update_user_details(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      userId,
      fname || null,
      mname || null,
      lname || null,
      email || null,
      addressline1 || null,
      addressline2 || null,
      province_id || null,
      city_id || null,
      ip
    ])
    // Use transaction for atomicity
    const result = await knex.transaction(async (trx) => {
      // Get current user to check if they have an address_id
      const currentUser = await User.query(trx).findById(userId);

      let addressId = currentUser.address_id;

      // Update or create address if address data is provided
      if (addressId) {
        // Update existing address
        await Address.query(trx).patchAndFetchById(addressId, {
          addressline1: addressline1 || null,
          addressline2: addressline2 || null,
          city_id: city_id || null,
        });
      } else if (city_id || addressline1) {
        // Create new address if data provided and user doesn't have one
        const newAddress = await Address.query(trx).insert({
          addressline1: addressline1 || null,
          addressline2: addressline2 || null,
          city_id: city_id || null,
        });
        addressId = newAddress.address_id;
      }

      // Update user profile
      await User.query(trx).patchAndFetchById(userId, {
        fname,
        mname: mname || null,
        lname,
        address_id: addressId,
        updated_at: new Date().toISOString(),
      });

      return { addressId };
    });

    // Fetch updated profile from view
    const updatedProfile = await knex('user_details_view')
      .where('user_id', userId)
      .first()

    const profileData = {
      user_id: updatedProfile.user_id,
      email: updatedProfile.email,
      fname: updatedProfile.fname,
      mname: updatedProfile.mname,
      lname: updatedProfile.lname,
      role_name: updatedProfile.role_name || 'Customer',
      role_id: updatedProfile.role_id,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
      address_id: updatedProfile.address_id,
      addressline1: updatedProfile.addressline1 || null,
      addressline2: updatedProfile.addressline2 || null,
      city_id: updatedProfile.city_id,
      city_name: updatedProfile.city_name || null,
      province_id: updatedProfile.province_id,
      province_name: updatedProfile.province_name || null,
    }

    return res.json(profileData);
  } catch (error) {
    console.error('Update user profile error:', error)
    // Check if error is from stored procedure validation
    if (error.message && error.message.includes('User has no address record')) {
      return res.status(400).json({ error: 'User has no address record to update' })
    }
    if (error.message && error.message.includes('City does not belong')) {
      return res.status(400).json({ error: 'City does not belong to the selected province' })
    }
    return res.status(500).json({ error: 'Failed to update user profile' })
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ error: "New password must be different from current password" });
    }

    // Fetch current user with password hash
    const user = await User.query().findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(user.pw_hash, currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Get IP address
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || null

    const knex = User.knex()

    // Call the stored procedure to update password and log event
    await knex.raw('CALL change_user_password(?, ?, ?)', [
      userId,
      hashedNewPassword,
      ip,
    ])

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};
