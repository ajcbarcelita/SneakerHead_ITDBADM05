-- Insert sample promo codes for testing

-- 1. Percentage-based promo code: 20% discount
INSERT INTO promo_codes (promo_code, discount_type, discount_value, min_order_value, is_first_time_only, start_date, end_date, used_count, usage_limit, is_active)
VALUES ('SAVE20', 'PERCENT', 20.00, 1000.00, 0, '2025-11-01', '2025-12-31', 0, 100, 1);

-- 2. Fixed amount promo code: 500 PHP discount
INSERT INTO promo_codes (promo_code, discount_type, discount_value, min_order_value, is_first_time_only, start_date, end_date, used_count, usage_limit, is_active)
VALUES ('FIXED500', 'FIXED', 500.00, 2000.00, 0, '2025-11-01', '2025-12-31', 0, 50, 1);

-- Optional: Additional promo codes for variety

-- 3. Holiday special: 35% discount (limited usage)
-- INSERT INTO promo_codes (promo_code, discount_type, discount_value, min_order_value, is_first_time_only, start_date, end_date, used_count, usage_limit, is_active)
-- VALUES ('HOLIDAY35', 'PERCENT', 35.00, 3000.00, 0, '2025-11-20', '2025-12-25', 0, 25, 1);

-- 4. First-time buyer: 15% discount
-- INSERT INTO promo_codes (promo_code, discount_type, discount_value, min_order_value, is_first_time_only, start_date, end_date, used_count, usage_limit, is_active)
-- VALUES ('WELCOME15', 'PERCENT', 15.00, 500.00, 1, '2025-11-01', '2025-12-31', 0, NULL, 1);

-- Verify inserts
SELECT * FROM promo_codes WHERE promo_code IN ('SAVE20', 'FIXED500');
