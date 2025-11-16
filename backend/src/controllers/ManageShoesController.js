import Shoe from "../models/Shoe.js";
import { logEvent } from "../services/logEventService.js";

export const getShoes = async (req, res) => {
    try {
        const knex = Shoe.knex()
        const shoes = await knex('shoes')
                    .select(
                        'shoe_id',
                        'name',
                        'price',
                        'brand_id',
                        'is_deleted'
                    )
        
        const formattedShoes = shoes.map(shoe => ({
            ...shoe,
            is_deleted: shoe.is_deleted ? true : false
        }));
        
        res.status(200).json({ shoes: formattedShoes });
    } catch (error) {
        console.error('Error in getShoes:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getBrands = async (req, res) => {
    try {
        const knex = Shoe.knex();
        const brands = await knex('ref_shoe_brands')
            .select(
                'brand_id',
                'brand_name',
            )
            .orderBy('brand_id', 'asc');

        const formattedBrands = brands.map(brand => ({
            ...brand,
            is_deleted: brand.is_deleted ? true : false
        }));

        res.status(200).json({ brands: formattedBrands });
    } catch (error) {
        console.error('Error in getBrands:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const addShoe = async (req, res) => {
    try {
        const {
            name,
            price,
            brand_id,
        } = req.body;

        const knex = Shoe.knex();

        // Check if there is a same shoe
        const existingShoe = await knex('shoes')
            .where('name', name)
            .first();
        if(existingShoe) {
            return res.status(400).json({ message: "Shoe with same name already exists" });
        }

        await knex('shoes').insert({
            name, 
            price,
            brand_id,
            created_at: new Date(),
            updated_at: new Date()
        })

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE INSERT SUCCESS',
            description: `Added shoe: ${name}`,
            ip
        });

        res.status(201).json({ message: "Shoe added successfully" });
    } catch (error) {
        console.error('Error in addShoe:', error);
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE INSERT FAILED',
            description: `Failed to add: ${req.body.name}`,
            ip
        });

        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

export const updateShoe = async (req, res) => {
    try {
        const { shoeId } = req.params
        const {
            name,
            brand_id,
            price,
            is_deleted
        } = req.body

        const isDeleted = is_deleted !== undefined ? (is_deleted ? 1 : 0) : null

        const knex = Shoe.knex()
        const result = await knex('shoes')
                    .where('shoe_id', shoeId)
                    .update({
                        name: knex.raw('COALESCE(?, name)', [name]),
                        brand_id: knex.raw('COALESCE(?, brand_id)', [brand_id]),
                        price: knex.raw('COALESCE(?, price)', [price]),
                        is_deleted: knex.raw('COALESCE(?, is_deleted)', [isDeleted]),
                        updated_at: new Date()
                    })

        if (result === 0) {
            return res.status(404).json({ message: "Shoe not found" });
        }

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE UPDATE SUCCESS',
            description: `Updated shoe: ${shoeId}`,
            ip
        });
        res.status(200).json({ message: "Shoe updated successfully" });
    } catch (error) {
        console.error('Error in updateShoe:', error);
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'SHOE UPDATE FAILED',
            description: `Failed to update: ${req.params.shoeId}`,
            ip
        });
        
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}