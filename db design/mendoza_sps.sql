-- Mendoza, John Kirbie's Stored Procedures

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

    START TRANSACTION;

    -- Fetch the existing address_id for this user
    SELECT address_id
    INTO v_address_id
    FROM users
    WHERE user_id = p_user_id
    LIMIT 1;

    -- If the user has no address, rollback and stop
    IF v_address_id IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User has no address record to update.';
    END IF;

    -- If a city is provided, validate that the city exists,
    -- and if a province is also provided, make sure they match
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

    -- Update users table (only change fields that are not null)
    UPDATE users
    SET
        fname      = COALESCE(p_fname, fname),
        mname      = COALESCE(p_mname, mname),
        lname      = COALESCE(p_lname, lname),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Update addresses table (only change fields that are not null)
    UPDATE addresses
    SET
        addressline1 = COALESCE(p_addressline1, addressline1),
        addressline2 = COALESCE(p_addressline2, addressline2),
        city_id      = COALESCE(p_city_id, city_id)
    WHERE address_id = v_address_id;

SELECT role_id FROM user;

    -- Log the event
    CALL sp_log_event(
        p_user_id,                 -- p_user_id
        role_id,                      -- role_id
        'UPDATE_PROFILE',          -- p_action
        'User updated profile details.', -- p_description
         p_ip_address                       -- ip
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
    START TRANSACTION;

    UPDATE users
    SET 
        pw_hash = p_new_pw_hash,
        updated_at = NOW()
    WHERE user_id = p_user_id;

SELECT role_id FROM user;

    CALL sp_log_event(
        p_user_id,
        role_id,
        'CHANGE_PASSWORD',
        'User changed password.',
        p_ip_address
    );

    COMMIT;
END $$
DELIMITER ;