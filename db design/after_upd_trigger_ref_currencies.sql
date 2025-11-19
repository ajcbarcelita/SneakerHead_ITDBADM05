DELIMITER $$

CREATE TRIGGER log_after_update_currency
AFTER UPDATE ON exchange_rates
FOR EACH ROW
BEGIN 
    IF OLD.rate_to_php <> NEW.rate_to_php THEN
        INSERT INTO user_logs(user_id, role_id, action, description)
        VALUES (1, 1, 'CURRENCY_RATE_UPDATE',
            CONCAT('Currency rates have been updated. ', OLD.currency_code, ': ', OLD.rate_to_php, ' -> ', NEW.rate_to_php));
    END IF;
END$$

DELIMITER ;

-- Trigger for shoes table
DELIMITER $$
CREATE TRIGGER validate_shoe_insert
BEFORE INSERT ON shoes
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price cannot be negative';
    END IF;
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shoe name cannot be empty';
    END IF;
END
$$ DELIMITER ;

DELIMITER $$
CREATE TRIGGER validate_shoe_update
BEFORE UPDATE ON shoes
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price cannot be negative';
    END IF;
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shoe name cannot be empty';
    END IF;
END
$$ DELIMITER ;


-- Trigger for branches table
DELIMITER $$
CREATE TRIGGER validate_branch_insert
BEFORE INSERT ON branches
FOR EACH ROW
BEGIN
    IF NEW.branch_name IS NULL OR TRIM(NEW.branch_name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Branch name cannot be empty';
    END IF;
END
$$ DELIMITER ;

DELIMITER $$
CREATE TRIGGER validate_branch_update
BEFORE UPDATE ON branches
FOR EACH ROW
BEGIN
    IF NEW.branch_name IS NULL OR TRIM(NEW.branch_name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Branch name cannot be empty';
    END IF;
END
$$ DELIMITER ;


DELIMITER $$
-- Trigger for promo_codes table
CREATE TRIGGER validate_promo_insert
BEFORE INSERT ON promo_codes
FOR EACH ROW
BEGIN
    IF NEW.discount_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Discount value cannot be negative';
    END IF;
    IF NEW.min_order_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Minimum order value cannot be negative';
    END IF;
    IF NEW.used_count < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Used count cannot be negative';
    END IF;
    IF NEW.usage_limit < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usage limit cannot be negative';
    END IF;
    IF NEW.start_date > NEW.end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date cannot be after end date';
    END IF;
END
$$ DELIMITER ;

DELIMITER $$
CREATE TRIGGER validate_promo_update
BEFORE UPDATE ON promo_codes
FOR EACH ROW
BEGIN
    IF NEW.discount_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Discount value cannot be negative';
    END IF;
    IF NEW.min_order_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Minimum order value cannot be negative';
    END IF;
    IF NEW.used_count < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Used count cannot be negative';
    END IF;
    IF NEW.usage_limit < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usage limit cannot be negative';
    END IF;
    IF NEW.start_date > NEW.end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date cannot be after end date';
    END IF;
END
$$ DELIMITER ;

-- Promo Code Limit check
DELIMITER $$

CREATE TRIGGER promo_usage_limit_check
BEFORE UPDATE ON promo_codes
FOR EACH ROW
BEGIN
    -- If usage limit is reached
    IF NEW.used_count >= NEW.usage_limit THEN
        SET NEW.is_active = 0; -- Set inactive
    END IF;
END$$

DELIMITER ;