-- Mix of Gonzales and Cariaga's Stored Procedures

-- SP to add a branch manager
DELIMITER $$
CREATE PROCEDURE add_branch_manager (
  IN p_email VARCHAR(255),
  IN p_pw_hash VARCHAR(255),
  IN p_fname VARCHAR(100),
  IN p_lname VARCHAR(100),
  IN p_mname VARCHAR(50),
  IN p_address_id INT
)
BEGIN

  INSERT INTO users (email, pw_hash, lname, fname, mname, address_id, role_id, is_deleted)
  VALUES (p_email, p_hash, p_lname, p_fname, p_mname, v_address_id, 2, 0);

END;
$$ 
DELIMITER ;

-- SP to update user info
DELIMITER $$

CREATE PROCEDURE update_user(
  IN p_user_id INT,
  IN p_pw_hash VARCHAR(255),
  IN p_fname VARCHAR(100),
  IN p_lname VARCHAR(100),
  IN p_mname VARCHAR(50),
  IN p_address_id INT,
  IN p_role_id INT,
  IN p_branch_id INT,
  IN p_is_deleted TINYINT(1)
)
BEGIN
  DECLARE user_exists INT DEFAULT 0;
  DECLARE user_is_assigned INT DEFAULT 0;
  DECLARE branch_has_manager INT DEFAULT 0;
  DECLARE current_role INT DEFAULT 0;
  START TRANSACTION;
  
  -- Check if user exists
  SELECT COUNT(*) INTO user_exists 
  FROM users 
  WHERE user_id = p_user_id;
  
  -- Get current role of user
  SELECT role_id into current_role
  FROM users
  WHERE user_id = p_user_id;
  
  IF user_exists = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
  END IF;
  
  -- Handle branch manager assignments
  IF current_role = 2 THEN
    -- Check if branch already has a different manager (only if assigning to a branch)
    IF p_branch_id IS NOT NULL THEN
      SELECT COUNT(*) INTO branch_has_manager
      FROM branch_admin_assignments
      WHERE branch_id = p_branch_id AND staff_id != p_user_id;
      
      IF branch_has_manager > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Branch already has a manager assigned';
      END IF;
    END IF;
    
    -- Check if user is already assigned
    SELECT COUNT(*) INTO user_is_assigned
    FROM branch_admin_assignments
    WHERE staff_id = p_user_id;
    
    IF user_is_assigned > 0 THEN
      -- Update or remove assignment
      IF p_branch_id IS NOT NULL THEN
        UPDATE branch_admin_assignments
        SET branch_id = p_branch_id, role_at_branch = p_role_id, assigned_at = NOW() 
        WHERE staff_id = p_user_id;
      ELSE
        -- Remove assignment if branch_id is NULL (unassign)
        DELETE FROM branch_admin_assignments 
        WHERE staff_id = p_user_id;
      END IF;
    ELSE
      -- Create new assignment only if branch_id is provided
      IF p_branch_id IS NOT NULL THEN
        INSERT INTO branch_admin_assignments(staff_id, branch_id, role_at_branch, assigned_at)
        VALUES(p_user_id, p_branch_id, 2, NOW());
      END IF;
    END IF;
  END IF;
  
  -- Update only the provided fields
  UPDATE users
  SET 
    pw_hash = COALESCE(p_pw_hash, pw_hash),
    fname = COALESCE(p_fname, fname),
    lname = COALESCE(p_lname, lname),
    mname = COALESCE(p_mname, mname),
    address_id = COALESCE(p_address_id, address_id),
    role_id = COALESCE(p_role_id, role_id),
    is_deleted = COALESCE(p_is_deleted, is_deleted),
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
  
  COMMIT;
END
$$ DELIMITER ;


-- SP to add a branch
DELIMITER $$
CREATE PROCEDURE add_branch (
  IN p_branch_name VARCHAR(100),
  IN p_address_line_1 VARCHAR(255),
  IN p_address_line_2 VARCHAR(255),
  IN p_city_id INT
)
BEGIN
  DECLARE v_address_id INT;
  
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

  START TRANSACTION;
  
  -- Insert into addresses then fetch the id
  INSERT INTO addresses (addressLine1, addressLine2, city_id)
  VALUES (p_address_line_1, p_address_line_2, p_city_id);
  
  -- Get the last inserted address_id
  SET v_address_id = LAST_INSERT_ID();
  
  -- Insert into branches
  INSERT INTO branches (branch_name, address_id, is_deleted)
  VALUES (p_branch_name, v_address_id, 0);
  
  COMMIT;
END;
$$ 
DELIMITER ;


-- SP to update branch info
DELIMITER $$
CREATE PROCEDURE update_branch (
  IN p_branch_id INT,
  IN p_branch_name VARCHAR(100),
  IN p_addressline1 VARCHAR(255),
  IN p_addressline2 VARCHAR(255),
  IN p_city_id INT,
  IN p_is_deleted TINYINT(1)
) 
BEGIN
  DECLARE branch_exists INT DEFAULT 0;
  DECLARE v_address_id INT;

  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  START TRANSACTION;
  
  -- Check if branch exists
  SELECT COUNT(*) INTO branch_exists FROM branches WHERE branch_id = p_branch_id;
  
  IF branch_exists = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Branch not found';
  END IF;
  
  -- Get the current address_id
  SELECT address_id INTO v_address_id FROM branches WHERE branch_id = p_branch_id;
  
  -- Update address information IF provided
  UPDATE addresses
  SET 
    addressline1 = COALESCE(p_addressline1, addressline1),
    addressline2 = COALESCE(p_addressline2, addressline2),
    city_id = COALESCE(p_city_id, city_id)
  WHERE address_id = v_address_id;
  
  -- Update branch information
  UPDATE branches
  SET 
    branch_name = COALESCE(p_branch_name, branch_name),
    is_deleted = COALESCE(p_is_deleted, is_deleted)
  WHERE branch_id = p_branch_id;
  
  COMMIT;
END;
$$ 
DELIMITER ;


-- Get Order History

DELIMITER $$
DROP PROCEDURE IF EXISTS get_branch_orders $$
CREATE PROCEDURE get_branch_orders(IN p_branch_id INT)
BEGIN
  SELECT 
    order_id,
    full_name,
    branch_id,
    total_price,
    promo_code,
    created_at,
    order_item_id,
    name AS shoe_name,
    img_path AS shoe_image,
    shoe_size,
    quantity,
    subtotal,
    brand_name
  FROM branch_orders_view
  WHERE branch_id = p_branch_id
  ORDER BY order_id DESC, order_item_id;
END $$
DELIMITER ;



-- Get stocks for a specific branch
DELIMITER $$
DROP PROCEDURE IF EXISTS get_branch_stocks $$ 
CREATE PROCEDURE get_branch_stocks(IN p_branch_id INT)
BEGIN
    SELECT 
        s.shoe_id AS id,
        s.name,
        s.price,
        b.brand_name AS brand,
        (SELECT img_path 
         FROM shoe_images 
         WHERE shoe_id = s.shoe_id 
         LIMIT 1) AS image,
        GROUP_CONCAT(
            CONCAT('{"size":', ss.shoe_size, ',"quantity":', ssi.stock, '}')
            ORDER BY ss.shoe_size
            SEPARATOR ','
        ) AS sizes_json
    FROM shoes s
    JOIN ref_shoe_brands b ON s.brand_id = b.brand_id
    JOIN shoe_size_inventory ssi ON s.shoe_id = ssi.shoe_id
    JOIN ref_us_sizes ss ON ssi.shoe_us_size = ss.shoe_size
    WHERE ssi.branch_id = p_branch_id
      AND s.is_deleted = FALSE
    GROUP BY s.shoe_id, s.name, s.price, b.brand_name
    ORDER BY s.name;
END$$

DELIMITER ;


-- Update Stock Procedure
DELIMITER $$

CREATE PROCEDURE update_shoe_stock(
    IN p_shoe_id INT,
    IN p_branch_id INT,
    IN p_sizes_json JSON  -- JSON array: [{"size": 8.0, "quantity": 10}, ...]
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE total_sizes INT;
    DECLARE current_size DECIMAL(3,1);
    DECLARE current_quantity INT;
    DECLARE shoe_exists INT DEFAULT 0;
    
     -- Exit handler for any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    -- No Dirty reads and Faster than SERIALIZABLE
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    -- Start transaction
    START TRANSACTION;
    
    -- Validate shoe exists and LOCK THE ROW FOR CONCURRENCY
    SELECT COUNT(*) INTO shoe_exists FROM shoes WHERE shoe_id = p_shoe_id 
    FOR UPDATE; 
    -- Locks each shoe row for update (I think enough na to since shoeId is PK so it would cascade to the quantity and stock of specific shoe)
    
    IF shoe_exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shoe not found';
    END IF;
    
    -- Get the length of json
    SET total_sizes = JSON_LENGTH(p_sizes_json);
    
    -- Loop through each size 
    WHILE i < total_sizes DO
        SET current_size = JSON_EXTRACT(p_sizes_json, CONCAT('$[', i, '].size'));
        SET current_quantity = JSON_EXTRACT(p_sizes_json, CONCAT('$[', i, '].quantity'));
        
        -- Update the stock
        UPDATE shoe_size_inventory
        SET stock = current_quantity
        WHERE shoe_id = p_shoe_id
          AND branch_id = p_branch_id
          AND shoe_us_size = current_size;
        
        SET i = i + 1;
    END WHILE;
    
    COMMIT;
END

$$ DELIMITER ;


-- View to get branch orders
DROP VIEW IF EXISTS branch_orders_view;

CREATE VIEW branch_orders_view AS
SELECT 
    o.order_id,
    CONCAT(u.fname,' ', u.lname) AS full_name,
    o.branch_id,
    o.total_price,
    o.promo_code,
    o.created_at,
    oi.order_item_id,
    oi.shoe_id,
    s.name,
    (SELECT img_path 
     FROM shoe_images 
     WHERE shoe_id = s.shoe_id 
     LIMIT 1) AS img_path,  
    oi.shoe_size,
    oi.quantity,
    oi.subtotal,
    sb.brand_id,
    sb.brand_name
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
LEFT JOIN branches b ON o.branch_id = b.branch_id
LEFT JOIN promo_codes pc ON o.promo_code = pc.promo_code
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN shoes s ON oi.shoe_id = s.shoe_id
LEFT JOIN ref_shoe_brands sb ON s.brand_id = sb.brand_id;


-- View to get shoes
CREATE VIEW shoe_list_view AS
SELECT 
    s.shoe_id,
    s.name,
    s.price,
    s.brand_id,
    s.is_deleted,
    GROUP_CONCAT(DISTINCT si.img_path) as img_paths,
    GROUP_CONCAT(DISTINCT rsc.category_name) as category_names
FROM shoes s
LEFT JOIN shoe_images si ON s.shoe_id = si.shoe_id
LEFT JOIN shoe_categories sc ON s.shoe_id = sc.shoe_id
LEFT JOIN ref_shoe_categories rsc ON sc.shoe_category_id = rsc.category_id
GROUP BY s.shoe_id, s.name, s.price, s.brand_id;

-- Get Top Customer
DELIMITER $$

CREATE PROCEDURE get_top_customer(
    IN p_period VARCHAR(10),
    IN p_branch VARCHAR(100)
)
BEGIN
    -- DAILY
    IF p_period = 'daily' THEN
        SELECT 
            u.user_id,
            CONCAT(u.fname, ' ', u.lname) AS full_name,
            SUM(o.total_price) AS total_spent
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN branches b ON o.branch_id = b.branch_id
        WHERE DATE(o.created_at) = CURDATE()
          AND (b.branch_name = p_branch)
        GROUP BY u.user_id
        ORDER BY total_spent DESC
        LIMIT 1;

    -- MONTHLY
    ELSEIF p_period = 'monthly' THEN
        SELECT 
            u.user_id,
            CONCAT(u.fname, ' ', u.lname) AS full_name,
            SUM(o.total_price) AS total_spent
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN branches b ON o.branch_id = b.branch_id
        WHERE YEAR(o.created_at) = YEAR(CURDATE())
          AND MONTH(o.created_at) = MONTH(CURDATE())
          AND (b.branch_name = p_branch)
        GROUP BY u.user_id
        ORDER BY total_spent DESC
        LIMIT 1;

    -- YEARLY
    ELSEIF p_period = 'yearly' THEN
        SELECT 
            u.user_id,
            CONCAT(u.fname, ' ', u.lname) AS full_name,
            SUM(o.total_price) AS total_spent
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN branches b ON o.branch_id = b.branch_id
        WHERE YEAR(o.created_at) = YEAR(CURDATE())
          AND (b.branch_name = p_branch)
        GROUP BY u.user_id
        ORDER BY total_spent DESC
        LIMIT 1;
    END IF;
END$$

DELIMITER ;


-- Get Top Selling Product

DELIMITER $$

CREATE PROCEDURE get_top_product(
    IN p_period VARCHAR(10),
    IN p_branch VARCHAR(100)
)
BEGIN
    -- DAILY
    IF p_period = 'daily' THEN
        SELECT 
            oi.shoe_id,
            s.name AS product_name,
            SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN shoes s ON oi.shoe_id = s.shoe_id
        JOIN branches b ON oi.branch_id = b.branch_id
        WHERE DATE(oi.created_at) = CURDATE()
          AND b.branch_name = p_branch
        GROUP BY oi.shoe_id
        ORDER BY total_sold DESC
        LIMIT 1;

    -- MONTHLY
    ELSEIF p_period = 'monthly' THEN
        SELECT 
            oi.shoe_id,
            s.name AS product_name,
            SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN shoes s ON oi.shoe_id = s.shoe_id
        JOIN branches b ON oi.branch_id = b.branch_id
        WHERE YEAR(oi.created_at) = YEAR(CURDATE())
          AND MONTH(oi.created_at) = MONTH(CURDATE())
          AND b.branch_name = p_branch
        GROUP BY oi.shoe_id
        ORDER BY total_sold DESC
        LIMIT 1;

    -- YEARLY
    ELSEIF p_period = 'yearly' THEN
        SELECT 
            oi.shoe_id,
            s.name AS product_name,
            SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN shoes s ON oi.shoe_id = s.shoe_id
        JOIN branches b ON oi.branch_id = b.branch_id
        WHERE YEAR(oi.created_at) = YEAR(CURDATE())
          AND b.branch_name = p_branch
        GROUP BY oi.shoe_id
        ORDER BY total_sold DESC
        LIMIT 1;
    END IF;
END$$

DELIMITER ;

-- Get Low Stock from specific branch
DELIMITER $$

CREATE PROCEDURE get_low_stock_branch(
    IN p_branch VARCHAR(100)
)
BEGIN
    SELECT 
        COUNT(s.shoe_id) AS low_stock
    FROM
        shoe_size_inventory s
    JOIN
        branches b ON s.branch_id = b.branch_id
    WHERE
        s.stock <= 5
        AND b.branch_name = p_branch;
END $$

DELIMITER ;