USE sneakerhead;

DELIMITER $$
CREATE TRIGGER stock_update
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    -- Try to reduce stock in one atomic update
    UPDATE shoe_size_inventory
    SET stock = stock - NEW.quantity
    WHERE shoe_id      = NEW.shoe_id
      AND shoe_us_size = NEW.shoe_size
      AND branch_id    = NEW.branch_id
      AND stock >= NEW.quantity;


    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Not enough stock or inventory record not found for this shoe / size / branch.';
    END IF;
END $$

DELIMITER ;


