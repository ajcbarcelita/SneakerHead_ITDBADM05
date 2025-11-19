-- Mendoza, John Kirbie's Stored Procedures

-- Updating User Details Stored Procedure
-- Updating User Details Stored Procedure
DELIMITER $$

CREATE PROCEDURE update_user_details (
    IN p_user_id INT,
    IN p_fname VARCHAR(100),
    IN p_mname VARCHAR(50),
    IN p_lname VARCHAR(100),
    IN p_addressline1 VARCHAR(255),
    IN p_addressline2 VARCHAR(255),
    IN p_province_id INT,
    IN p_city_id INT,
    IN p_ip_address VARCHAR(45)
)
BEGIN
    DECLARE v_address_id INT;
    DECLARE v_city_province_id INT;
    DECLARE v_role_id INT;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    START TRANSACTION;

    -- Fetch the existing address_id and role_id for this user
    SELECT address_id, role_id
    INTO v_address_id, v_role_id
    FROM users
    WHERE user_id = p_user_id
    LIMIT 1;

    -- If user does not exist
    IF v_role_id IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User role not found.';
    END IF;

    -- Validate city and province if city is provided
    IF p_city_id IS NOT NULL THEN
        SELECT province_id
        INTO v_city_province_id
        FROM ref_ph_cities_municipalities
        WHERE city_id = p_city_id
        LIMIT 1;

        -- City not found
        IF v_city_province_id IS NULL THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid city selected.';
        END IF;

        -- If province is provided, validate the pair
        IF p_province_id IS NOT NULL AND v_city_province_id <> p_province_id THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'City does not belong to the selected province.';
        END IF;
    END IF;

    -- If the user has no address yet, create one from the parameters
    IF v_address_id IS NULL THEN

        -- Basic check so we do not violate NOT NULL and FK constraints
        IF p_city_id IS NULL OR p_addressline1 IS NULL THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Cannot create address, missing required address details.';
        END IF;

        INSERT INTO addresses (addressline1, addressline2, city_id)
        VALUES (p_addressline1, p_addressline2, p_city_id);

        SET v_address_id = LAST_INSERT_ID();

        -- Attach the new address to the user
        UPDATE users
        SET address_id = v_address_id
        WHERE user_id = p_user_id;

    ELSE
        -- User already has an address, so update it
        UPDATE addresses
        SET
            addressline1 = p_addressline1,
            addressline2 = p_addressline2,
            city_id      = p_city_id
        WHERE address_id = v_address_id;
    END IF;

    -- Update users table
    UPDATE users
    SET
        fname      = p_fname,
        mname      = p_mname,
        lname      = p_lname,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Log the event
    CALL sp_log_event(
        p_user_id,                      -- p_user_id
        v_role_id,                      -- role_id
        'UPDATE_PROFILE',               -- p_action
        'User updated profile details.',-- p_description
        p_ip_address                    -- ip_address
    );

    COMMIT;
END $$

DELIMITER ;


-- Changing Password Stored Procedure 
DELIMITER $$
CREATE PROCEDURE change_user_password (
    IN p_user_id INT,
    IN p_new_pw_hash VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    DECLARE v_role_id INT;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    START TRANSACTION;

    -- Fetch role_id for logging
    SELECT role_id
    INTO v_role_id
    FROM users
    WHERE user_id = p_user_id
    LIMIT 1;

    UPDATE users
    SET 
        pw_hash = p_new_pw_hash,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Log the event
    CALL sp_log_event(
        p_user_id,
        v_role_id,
        'CHANGE_PASSWORD',
        'User changed password.',
        p_ip_address
    );

    COMMIT;
END $$
DELIMITER ;

-- Check out SP
DELIMITER $$

USE `sneakerhead`$$

DROP PROCEDURE IF EXISTS `checkout_cart`;

CREATE PROCEDURE `checkout_cart` (
    IN  p_user_id        INT UNSIGNED,
    IN  p_cart_id        INT UNSIGNED,
    IN  p_promo_code     VARCHAR(12),
    IN  p_ip_address     VARCHAR(45),
    OUT p_order_id       INT UNSIGNED
)
BEGIN
    DECLARE v_currency_code          CHAR(3);
    DECLARE v_currency_rate          DECIMAL(12,6);
    DECLARE v_item_count             INT UNSIGNED;
    DECLARE v_total_price            DECIMAL(12,2);
    DECLARE v_discount_amount        DECIMAL(12,2);
    DECLARE v_final_total            DECIMAL(12,2);

    DECLARE v_promo_code             VARCHAR(12);
    DECLARE v_discount_type          VARCHAR(10);
    DECLARE v_discount_value         DECIMAL(10,2);
    DECLARE v_promo_exists_cnt       INT UNSIGNED;
    DECLARE v_insufficient_stock_cnt INT UNSIGNED;

    -- Normalize promo code to uppercase
    IF p_promo_code IS NULL OR p_promo_code = '' THEN
        SET v_promo_code = NULL;
    ELSE
        SET v_promo_code = UPPER(p_promo_code);
    END IF;

    START TRANSACTION;

    -- 1. Verify cart exists and get currency info
    SELECT 
        sc.currency_code,
        sc.currency_rate_to_peso
    INTO 
        v_currency_code,
        v_currency_rate
    FROM shopping_cart sc
    WHERE sc.cart_id = p_cart_id
      AND sc.user_id = p_user_id
    LIMIT 1;

    IF v_currency_code IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cart not found or does not belong to user';
    END IF;

    -- 2. Ensure cart is not empty and calculate subtotal (already in PHP)
    SELECT 
        COUNT(*),
        COALESCE(SUM(price_at_addition * quantity), 0)
    INTO 
        v_item_count,
        v_total_price
    FROM shopping_cart_items
    WHERE cart_id = p_cart_id;

    IF v_item_count = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cart is empty - cannot checkout';
    END IF;

    -- 3. Check stock availability before deducting
    SELECT 
        COUNT(*)
    INTO 
        v_insufficient_stock_cnt
    FROM shopping_cart_items sci
    JOIN shoe_size_inventory ssi
      ON ssi.shoe_id      = sci.shoe_id
     AND ssi.shoe_us_size = sci.shoe_us_size
     AND ssi.branch_id    = sci.shoe_branch_id
    WHERE sci.cart_id = p_cart_id
      AND sci.quantity > ssi.stock;

    IF v_insufficient_stock_cnt > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient stock for one or more items';
    END IF;

    -- 4. Process promo code and calculate discount
    SET v_discount_amount = 0;
    SET v_final_total = v_total_price;

    IF v_promo_code IS NOT NULL THEN
        -- Get discount details (front end validation already happened)
        SELECT 
            discount_type,
            discount_value
        INTO 
            v_discount_type,
            v_discount_value
        FROM promo_codes
        WHERE promo_code = v_promo_code;

        -- Calculate discount based on type (PERCENT or FIXED)
        IF v_discount_type = 'PERCENT' THEN
            SET v_discount_amount = v_total_price * (v_discount_value / 100);
        ELSEIF v_discount_type = 'FIXED' THEN
            SET v_discount_amount = v_discount_value;
        END IF;

        -- Apply discount to total
        SET v_final_total = v_total_price - v_discount_amount;

        -- Increment promo code usage count
        UPDATE promo_codes
        SET used_count = COALESCE(used_count, 0) + 1
        WHERE promo_code = v_promo_code;
    END IF;

    -- 5. Create the order (all prices in PHP)
    INSERT INTO orders (
        user_id,
        branch_id,
        promo_code,
        total_price,
        currency_code,
        currency_rate_to_peso,
        total_price_conversion,
        created_at
    ) VALUES (
        p_user_id,
        (SELECT branch_id FROM shopping_cart WHERE cart_id = p_cart_id),
        v_promo_code,
        v_final_total,
        v_currency_code,
        v_currency_rate,
        v_final_total * v_currency_rate,
        NOW()
    );

    SET p_order_id = LAST_INSERT_ID();

    -- 6. Insert order items from cart
    INSERT INTO order_items (
        order_id,
        shoe_id,
        shoe_size,
        branch_id,
        quantity,
        price_at_purchase,
        subtotal,
        created_at
    )
    SELECT
        p_order_id,
        sci.shoe_id,
        sci.shoe_us_size,
        sci.shoe_branch_id,
        sci.quantity,
        sci.price_at_addition,
        sci.price_at_addition * sci.quantity,
        NOW()
    FROM shopping_cart_items sci
    WHERE sci.cart_id = p_cart_id;

    -- 7. Deduct stock
    UPDATE shoe_size_inventory ssi
    JOIN shopping_cart_items sci
      ON ssi.shoe_id      = sci.shoe_id
     AND ssi.shoe_us_size = sci.shoe_us_size
     AND ssi.branch_id    = sci.shoe_branch_id
    SET ssi.stock = ssi.stock - sci.quantity
    WHERE sci.cart_id = p_cart_id;

    -- 8. Safety check: verify no negative stock
    SELECT 
        COUNT(*)
    INTO v_insufficient_stock_cnt
    FROM shoe_size_inventory ssi
    WHERE ssi.stock < 0;

    IF v_insufficient_stock_cnt > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Concurrent checkout detected - stock went negative';
    END IF;

    -- 9. Clear cart
    DELETE FROM shopping_cart_items
    WHERE cart_id = p_cart_id;

    DELETE FROM shopping_cart
    WHERE cart_id = p_cart_id;

    -- 10. Log the checkout action
    INSERT INTO user_logs (
        user_id,
        action,
        description,
        ip_address
    ) VALUES (
        p_user_id,
        'CHECKOUT',
        CONCAT('Order #', p_order_id, ' created. Promo: ', COALESCE(v_promo_code, 'None'), ', Total: ₱', v_final_total),
        p_ip_address
    );

    COMMIT;
END$$

DELIMITER ;
