import User from "../models/User.js";
import Branch from "../models/Branch.js";

export const getUsers = async (req, res) => {
    try {
        const knex = User.knex();
        const users = await knex("users")
            .select(
                "users.user_id as id",
                "users.fname",
                "users.mname", 
                "users.lname",
                "users.email", 
                "users.role_id",
                "ref_roles.role_name as role",
                "branches.branch_id",
                "branches.branch_name",
                "users.created_at",
                "users.updated_at",
                "users.is_deleted"
            )
            .leftJoin("ref_roles", "users.role_id", "ref_roles.role_id")
            .leftJoin("addresses", "users.address_id", "addresses.address_id")
            .leftJoin("branches", "addresses.address_id", "branches.address_id")
            .where("users.is_deleted", false)
            .orderBy("branches.branch_id", "asc");

        // Format the response
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: `${user.fname}${user.mname ? ' ' + user.mname : ''} ${user.lname}`.trim(),
            email: user.email,
            role: user.role,
            branchId: user.branch_id,
            branchName: user.branch_name,
            fname: user.fname,
            mname: user.mname,
            lname: user.lname,
            role_id: user.role_id,
            created_at: user.created_at,
            updated_at: user.updated_at
        }));

        res.status(200).json({ users: formattedUsers });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getBranches = async (req, res) => {
    try {
        const knex = Branch.knex();
        const branches = await knex("branches")
            .select(
                "branches.branch_id",
                "branches.branch_name", 
                "branches.address_id",
                "addresses.addressline1",
                "addresses.addressline2", 
                "addresses.city_id",
                "ref_ph_cities_municipalities.city_name"
            )
            .leftJoin("addresses", "branches.address_id", "addresses.address_id")
            .leftJoin("ref_ph_cities_municipalities", "addresses.city_id", "ref_ph_cities_municipalities.city_id")
            .orderBy("branches.branch_id", "asc");

        const formattedBranches = branches.map(branch => ({
            branch_id: branch.branch_id,
            branch_name: branch.branch_name,
            address_id: branch.address_id,
            addressline1: branch.addressline1,
            addressline2: branch.addressline2,
            city_id: branch.city_id,
            city_name: branch.city_name
        }));

        res.status(200).json({ branches: formattedBranches });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// frontend API call
const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update user');
    }

    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
