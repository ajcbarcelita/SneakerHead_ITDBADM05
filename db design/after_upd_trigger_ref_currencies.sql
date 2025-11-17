DELIMITER $$

CREATE TRIGGER log_after_update_currency
AFTER UPDATE ON exchange_rates
FOR EACH ROW
BEGIN 
    IF OLD.rate_to_php != NEW.rate_to_php THEN
        INSERT INTO user_logs(user_id, role_id, action, description)
        VALUES (NULL, NULL, 'CURRENCY_RATE_UPDATE', 'Currency rates have been updated!');
    END IF;
END$$

DELIMITER ;