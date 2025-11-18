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
            SET MESSAGE_TEXT = 'User not found.';
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