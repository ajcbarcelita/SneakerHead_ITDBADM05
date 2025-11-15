import User from "../models/User.js";
import Branch from "../models/Branch.js";
import City_Municipality from "../models/City_Municipality.js";
import { logEvent } from "../services/logEventService.js";

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
            is_deleted: Boolean(user.is_deleted),
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
                "ref_ph_cities_municipalities.city_name",
                "branches.is_deleted"
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
            city_name: branch.city_name,
            is_deleted: Boolean(branch.is_deleted)
        }));

        res.status(200).json({ branches: formattedBranches });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getCities = async (req, res) => {
    try {
        const knex = City_Municipality.knex();
        const cities = await knex("ref_ph_cities_municipalities")
            .select(
                "city_id",
                "city_name"
            )
            .orderBy("city_id", "asc");

        const formattedCities = cities.map(city => ({
            city_id: city.city_id,
            city_name: city.city_name
        }));

        res.status(200).json({ cities: formattedCities });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const addBranch = async (req, res) => {
    try {
        const { 
            branch_name, 
            addressline1, 
            addressline2, 
            city_id 
        } = req.body;

        const knex = Branch.knex();
        
        await knex.raw('CALL add_branch(?, ?, ?, ?)', [
            branch_name,
            addressline1 || '',
            addressline2 || '',
            city_id
        ]);

        res.status(201).json({ message: "Branch added successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { 
            branch_name, 
            addressline1, 
            addressline2, 
            city_id,
            is_deleted 
        } = req.body;

        // Convert is_deleted to proper
        const isDeletedValue = is_deleted !== undefined ? (is_deleted ? 1 : 0) : null;

        const knex = Branch.knex();
        
        // Call the stored procedure
        await knex.raw('CALL update_branch(?, ?, ?, ?, ?, ?)', [
            branchId,
            branch_name || null,
            addressline1 || null,
            addressline2 || null,
            city_id || null,
            isDeletedValue
        ]);

        res.status(200).json({ message: "Branch updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            email, 
            pw_hash,
            fname,   
            lname,    
            mname, 
            address_id, 
            role_id, 
            is_deleted
        } = req.body;

        // Convert is_deleted to proper MySQL boolean
        const isDeletedValue = is_deleted !== undefined ? (is_deleted ? 1 : 0) : null;

        const knex = User.knex();
        
        // Call the stored procedure with correct parameter order
        await knex.raw('CALL update_user(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            userId,
            email || null,
            pw_hash || null, 
            fname || null, 
            lname || null, 
            mname || null,
            address_id || null,
            role_id || null,
            isDeletedValue
        ]);

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
