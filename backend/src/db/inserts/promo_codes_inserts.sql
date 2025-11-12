INSERT INTO promo_codes (promo_code, discount_type, discount_value, min_order_value, is_first_time_only, start_date, end_date, used_count, usage_limit, is_active) VALUES
('WELCOME15', 'PERCENT', 15.00, 500.00, 1, '2024-01-01', '2022-12-31', 45, 200, 1),
('FREESHIP99', 'FIXED', 99.00, 800.00, 0, '2024-01-01', '2022-12-31', 78, NULL, 1),
('SUMMER25', 'PERCENT', 25.00, 1500.00, 0, '2024-06-01', '2022-08-31', 32, 100, 1),
('SAVE500', 'FIXED', 500.00, 2500.00, 0, '2024-01-01', '2022-12-31', 18, 50, 1),
('FLASH30', 'PERCENT', 30.00, 2000.00, 0, '2024-11-01', '2022-11-30', 12, 30, 1);