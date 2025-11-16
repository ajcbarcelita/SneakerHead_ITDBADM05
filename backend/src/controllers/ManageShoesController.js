import Shoe from "../models/Shoe.js";
import ShoeImage from "../models/ShoeImage.js";
import ShoeCategory from "../models/ShoeCategory.js";
import RefShoeCategory from "../models/RefShoeCategory.js";
import { logEvent } from "../services/logEventService.js";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../services/cloudinaryService.js";

// Helper function to format date for MySQL
const getMySQLDateTime = (date = new Date()) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const getShoes = async (req, res) => {
    try {
        const knex = Shoe.knex();
        const shoes = await knex('shoes')
            .select(
                'shoes.shoe_id',
                'shoes.name',
                'shoes.price',
                'shoes.brand_id',
                'shoes.is_deleted',
                knex.raw('(SELECT img_path FROM shoe_images WHERE shoe_images.shoe_id = shoes.shoe_id LIMIT 1) as img_path'),
                knex.raw('GROUP_CONCAT(DISTINCT rsc.category_name) as category_names')
            )
            .leftJoin('shoe_categories as sc', 'shoes.shoe_id', 'sc.shoe_id')
            .leftJoin('ref_shoe_categories as rsc', 'sc.shoe_category_id', 'rsc.category_id')
            .groupBy('shoes.shoe_id');
        
        const formattedShoes = shoes.map(shoe => ({
            ...shoe,
            is_deleted: shoe.is_deleted ? true : false,
            img_paths: shoe.img_path ? [shoe.img_path] : [],
            category_names: shoe.category_names ? shoe.category_names.split(',') : []
        }));
        
        res.status(200).json({ shoes: formattedShoes });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getBrands = async (req, res) => {
    try {
        const knex = Shoe.knex();
        const brands = await knex('ref_shoe_brands')
            .select('brand_id', 'brand_name')
            .orderBy('brand_id', 'asc');

        res.status(200).json({ brands });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getCategories = async (req, res) => {
    try {
        const knex = RefShoeCategory.knex();
        const categories = await knex('ref_shoe_categories')
            .select('category_id', 'category_name')
            .orderBy('category_name', 'asc');

        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const addShoe = async (req, res) => {
    const trx = await Shoe.startTransaction();
    try {
        const { name, price, brand_id, categories = [] } = req.body;

        // Validate required fields
        if (!name || !price || !brand_id) {
            await trx.rollback();
            return res.status(400).json({ message: "Name, price, and brand are required" });
        }

        // Validate price is a positive number
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            await trx.rollback();
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        // Check if shoe with same name exists
        const existingShoe = await Shoe.query(trx).where('name', name).first();
        if(existingShoe) {
            await trx.rollback();
            return res.status(400).json({ message: "Shoe with same name already exists" });
        }

        // Insert shoe with required fields
        const shoe = await Shoe.query(trx).insert({
            name, 
            price: priceNum,
            brand_id: parseInt(brand_id),
            created_at: getMySQLDateTime(),
            updated_at: getMySQLDateTime()
        });

        // Upload images to Cloudinary and insert one by one
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const imageUrl = await uploadToCloudinary(file);
                    await ShoeImage.query(trx).insert({
                        shoe_id: parseInt(shoe.shoe_id),
                        img_path: imageUrl
                    });
                } catch (uploadError) {
                    await trx.rollback();
                    return res.status(500).json({ message: "Failed to upload images", error: uploadError.message });
                }
            }
        }

        // Insert categories
        if (categories.length > 0) {
            const parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
            for (const category_id of parsedCategories) {
                await ShoeCategory.query(trx).insert({
                    shoe_id: parseInt(shoe.shoe_id),
                    shoe_category_id: parseInt(category_id)
                });
            }
        }

        await trx.commit();

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE_INSERT_SUCCESS',
            description: `Added shoe: ${name}`,
            ip
        });

        res.status(201).json({ message: "Shoe added successfully", shoe_id: shoe.shoe_id });
    } catch (error) {
        await trx.rollback();
        
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE_INSERT_FAILED',
            description: `Failed to add: ${req.body.name}`,
            ip
        });

        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateShoe = async (req, res) => {
    const trx = await Shoe.startTransaction();
    try {
        const { shoeId } = req.params;
        const knex = Shoe.knex();

        const { 
            name, 
            brand_id, 
            price, 
            is_deleted, 
            categories = [], 
            images_to_delete = [] 
        } = req.body || {};

        // Conversions for DB compliance
        const parsedShoeId = parseInt(shoeId);
        let isDeletedValue = null;
        if (is_deleted !== undefined && is_deleted !== null) {
            isDeletedValue = (is_deleted === 'false') ? 0 : (is_deleted ? 1 : 0);
        }

        // Check if shoe exists
        const existingShoe = await Shoe.query(trx).findById(parsedShoeId);
        if (!existingShoe) {
            await trx.rollback();
            return res.status(404).json({ message: "Shoe not found" });
        }

        // Update shoe basic info with COALESCE
        await Shoe.query(trx).findById(parsedShoeId).patch({
            name: knex.raw('COALESCE(?, name)', [name]),
            brand_id: knex.raw('COALESCE(?, brand_id)', [brand_id ? parseInt(brand_id) : null]),
            price: knex.raw('COALESCE(?, price)', [price ? parseFloat(price) : null]),
            is_deleted: knex.raw('COALESCE(?, is_deleted)', [isDeletedValue]),
            updated_at: getMySQLDateTime()
        });

        // Delete images from Cloudinary and database
        if (images_to_delete && images_to_delete.length > 0) {
            let parsedImagesToDelete;
            try {
                parsedImagesToDelete = Array.isArray(images_to_delete) 
                    ? images_to_delete 
                    : (typeof images_to_delete === 'string' ? JSON.parse(images_to_delete) : []);
            } catch (parseError) {
                parsedImagesToDelete = [];
            }

            if (parsedImagesToDelete.length > 0) {
                // Delete from Cloudinary first
                const cloudinaryDeletions = parsedImagesToDelete.map(async (imageUrl) => {
                    try {
                        const publicId = extractPublicId(imageUrl);
                        
                        if (publicId) {
                            await deleteFromCloudinary(publicId);
                            return true;
                        }
                    } catch (cloudinaryError) {
                        return false;
                    }
                });

                await Promise.allSettled(cloudinaryDeletions);
                
                // Delete from database
                const deleteResult = await ShoeImage.query(trx)
                    .where('shoe_id', parsedShoeId)
                    .whereIn('img_path', parsedImagesToDelete)
                    .delete();
            }
        }

        // Upload new images one by one
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const imageUrl = await uploadToCloudinary(file);
                    await ShoeImage.query(trx).insert({
                        shoe_id: parsedShoeId,
                        img_path: imageUrl
                    });
                } catch (uploadError) {
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                }
            }
        }

        // Update categories
        if (categories !== undefined) {
            // Delete existing categories
            await ShoeCategory.query(trx).where('shoe_id', parsedShoeId).delete();
            
            let parsedCategories;
            try {
                parsedCategories = Array.isArray(categories) 
                    ? categories 
                    : (typeof categories === 'string' ? JSON.parse(categories) : []);
            } catch (parseError) {
                parsedCategories = [];
            }
            
            // Insert new categories
            if (parsedCategories.length > 0) {
                for (const category_id of parsedCategories) {
                    await ShoeCategory.query(trx).insert({
                        shoe_id: parsedShoeId,
                        shoe_category_id: parseInt(category_id)
                    });
                }
            }
        }

        await trx.commit();

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE_UPDATE_SUCCESS',
            description: `Updated shoe: ${parsedShoeId} (archived: ${isDeletedValue})`,
            ip
        });
        
        res.status(200).json({ message: "Shoe updated successfully" });
    } catch (error) {
        await trx.rollback();
        
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE_UPDATE_FAILED',
            description: `Failed to update: ${req.params.shoeId}`,
            ip
        });
        
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getShoeById = async (req, res) => {
    try {
        const { shoeId } = req.params;
        const parsedShoeId = parseInt(shoeId);
        const knex = Shoe.knex();
        
        // Get shoe basic info
        const shoe = await knex('shoes').where('shoe_id', parsedShoeId).first();
        if (!shoe) {
            return res.status(404).json({ message: "Shoe not found" });
        }

        // Get shoe images
        const images = await knex('shoe_images').where('shoe_id', parsedShoeId).select('img_path');

        // Get shoe categories
        const categories = await knex('shoe_categories')
            .where('shoe_categories.shoe_id', parsedShoeId)
            .join('ref_shoe_categories', 'shoe_categories.shoe_category_id', 'ref_shoe_categories.category_id')
            .select('ref_shoe_categories.category_id');

        const formattedShoe = {
            ...shoe,
            is_deleted: shoe.is_deleted ? true : false,
            images: images.map(img => img.img_path),
            categories: categories.map(cat => parseInt(cat.category_id)) // Ensure integers
        };

        res.status(200).json({ shoe: formattedShoe });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}