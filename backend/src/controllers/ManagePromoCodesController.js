import PromoCode from "../models/PromoCode.js";
import { logEvent } from "../services/logEventService.js";

export const getPromoCodes = async (req, res) => {
    try {
        const knex = PromoCode.knex()
        const promoCodes = await knex('promo_codes')
                        .select(
                            'promo_code',
                            'discount_type',
                            'discount_value',
                            'min_order_value',
                            'is_first_time_only',
                            'start_date',
                            'end_date',
                            'used_count',
                            'usage_limit',
                            'is_active'
                        );

        const formattedPromoCodes = promoCodes.map(code => ({
            ...code,
            discount_type: code.discount_type === 'PERCENT' ? 'Percentage' : 'Fixed Amount',
            is_first_time_only: code.is_first_time_only ? true : false,
            is_active: code.is_active ? true : false
        }));
        
        res.status(200).json({ codes: formattedPromoCodes });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", });
    }
}

export const addPromoCode = async (req, res) => {
    try {
        const {
            promo_code,
            discount_type,
            discount_value,
            min_order_value,
            is_first_time_only,
            start_date,
            end_date,
            usage_limit,
            is_active
        } = req.body;

        const knex = PromoCode.knex();
        
        // Check if promo code already exists
        const existingPromo = await knex('promo_codes')
            .where('promo_code', promo_code)
            .first();
            
        if (existingPromo) {
            return res.status(400).json({ message: "Promo code already exists" });
        }

        // Date formatting function
        const formatDateForMySQL = (dateString) => {
            if (!dateString) return null;
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        // Map frontend values to database values
        const dbDiscountType = discount_type === 'Percentage' ? 'PERCENT' : 'FIXED';
        const dbIsFirstTimeOnly = is_first_time_only ? 1 : 0;
        const dbIsActive = is_active ? 1 : 0;

        await knex('promo_codes').insert({
            promo_code: promo_code.substring(0, 12),
            discount_type: dbDiscountType,
            discount_value: parseFloat(discount_value),
            min_order_value: min_order_value ? parseFloat(min_order_value) : 0,
            is_first_time_only: dbIsFirstTimeOnly,
            start_date: formatDateForMySQL(start_date),
            end_date: formatDateForMySQL(end_date),
            usage_limit: usage_limit ? parseInt(usage_limit) : 100,
            is_active: dbIsActive,
            used_count: 0
        });

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'PROMO_CODE_INSERT_SUCCESS',
            description: `Added promo: ${promo_code}`,
            ip
        });
        
        res.status(201).json({ message: "Promo code added successfully" });
    } catch (error) {
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'PROMO_CODE_INSERT_FAILED',
            description: `Failed to add: ${req.body.promo_code}`,
            ip
        });
        
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
}

export const updatePromoCode = async (req, res) => {
    try {
        const { promoCode } = req.params;
        const {
            end_date,
            usage_limit,
            is_active
        } = req.body;   

        const formatDateForMySQL = (dateString) => {
            if (!dateString) return null;
            // If it's already in YYYY-MM-DD format return as is
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }
            // If it's an ISO datetime extract the date part
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Get YYYY-MM-DD
        };

        // Convert is_active to proper integer value (tinyint)
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : null;

        const knex = PromoCode.knex();
        const updateData = {};
        
        if (end_date !== undefined) {
            updateData.end_date = formatDateForMySQL(end_date);
        }
        
        if (usage_limit !== undefined) {
            updateData.usage_limit = parseInt(usage_limit);
        }
        
        if (is_active !== undefined) {
            updateData.is_active = isActive;
        }

        const result = await knex('promo_codes')
            .where('promo_code', promoCode)
            .update(updateData);

        if (result === 0) {
            return res.status(404).json({ 
                message: "Promo code not found" 
            });
        }

        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'PROMO_CODE_UPDATE_SUCCESS',
            description: `Updated promo: ${promoCode}`,
            ip
        });
        
        res.status(200).json({ message: "Promo code updated successfully" });

    } catch (error) {
        const forwarded = req.get("x-forwarded-for");
        const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);
        await logEvent({
            user_id: res.user?.user_id || null,
            role_id: res.user?.role_id || null,
            action: 'PROMO_CODE_UPDATE_FAILED',
            description: `Failed to update: ${req.params.promoCode}`,
            ip
        });
        
        res.status(500).json({ message: "Internal server error"});
    }
}