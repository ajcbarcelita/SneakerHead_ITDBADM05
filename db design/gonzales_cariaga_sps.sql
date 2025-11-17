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
CREATE PROCEDURE update_user (
  IN p_user_id INT,
  IN p_email VARCHAR(255),
  IN p_pw_hash VARCHAR(255),
  IN p_fname VARCHAR(100),
  IN p_lname VARCHAR(100),
  IN p_mname VARCHAR(50),
  IN p_address_id INT,
  IN p_role_id INT,
  IN p_is_deleted TINYINT(1)
) 
BEGIN
  DECLARE user_exists INT DEFAULT 0;
  
  START TRANSACTION;
  
  -- Check if user exists
  SELECT COUNT(*) INTO user_exists FROM users WHERE user_id = p_user_id;
  
  IF user_exists = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
  END IF;
  
  -- Update only the provided fields
  UPDATE users
  SET 
    email = COALESCE(p_email, email),
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
END;
$$ 
DELIMITER ;


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

CREATE PROCEDURE get_branch_stocks(IN p_branch_id INT)
BEGIN
    SELECT 
        s.shoe_id AS id,
        s.name,
        s.price,
        b.brand_name AS brand,
        si.img_path AS image,
        GROUP_CONCAT(
            CONCAT('{"size":', ss.shoe_size, ',"quantity":', ssi.stock, '}')
            ORDER BY ss.shoe_size
            SEPARATOR ','
        ) AS sizes_json
    FROM shoes s
    JOIN ref_shoe_brands b ON s.brand_id = b.brand_id
    JOIN shoe_size_inventory ssi ON s.shoe_id = ssi.shoe_id
    JOIN ref_us_sizes ss ON ssi.shoe_us_size = ss.shoe_size
    LEFT JOIN shoe_images si ON s.shoe_id = si.shoe_id
    WHERE ssi.branch_id = p_branch_id
      AND s.is_deleted = FALSE
    GROUP BY s.shoe_id, s.name, s.price, b.brand_name, si.img_path
    ORDER BY s.name;
END$$

DELIMITER ;

SELECT * FROM shoe_size_inventory;

CALL get_branch_stocks(1);


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
    
    -- Get the number of sizes in the JSON array
    SET total_sizes = JSON_LENGTH(p_sizes_json);
    
    -- Loop through each size and update
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
    
    -- Commit the transaction
    COMMIT;
END$$

DELIMITER ;


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

-- SP to add shoe
DELIMITER $$
CREATE PROCEDURE add_shoe(
  IN p_brand_id INT,
  IN p_name VARCHAR(50),
  IN p_price DECIMAL(10, 2),
  IN p_img_paths TEXT,  -- Comma-separated image paths
  IN p_categories TEXT  -- Comma-separated category IDs
)
BEGIN
  DECLARE v_shoe_id INT;
  DECLARE v_done INT DEFAULT FALSE;
  DECLARE v_img_path VARCHAR(255);
  DECLARE v_category_id INT;
  DECLARE v_img_cursor CURSOR FOR 
    SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_img_paths, ',', numbers.n), ',', -1)) as img_path
    FROM (
      SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
      UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    ) numbers
    WHERE CHAR_LENGTH(p_img_paths) - CHAR_LENGTH(REPLACE(p_img_paths, ',', '')) >= numbers.n - 1;
  
  DECLARE v_cat_cursor CURSOR FOR 
    SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_categories, ',', numbers.n), ',', -1)) as category_id
    FROM (
      SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
      UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    ) numbers
    WHERE CHAR_LENGTH(p_categories) - CHAR_LENGTH(REPLACE(p_categories, ',', '')) >= numbers.n - 1;
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

  -- Start transaction
  START TRANSACTION;

  -- Insert the shoe
  INSERT INTO shoes (brand_id, name, price, is_deleted)
  VALUES (p_brand_id, p_name, p_price, 0);
  
  -- Get the last inserted shoe_id
  SET v_shoe_id = LAST_INSERT_ID();

  -- Insert multiple images
  IF p_img_paths IS NOT NULL AND p_img_paths != '' THEN
    OPEN v_img_cursor;
    
    img_loop: LOOP
      FETCH v_img_cursor INTO v_img_path;
      IF v_done THEN
        LEAVE img_loop;
      END IF;
      
      INSERT INTO shoe_images (shoe_id, img_path)
      VALUES (v_shoe_id, v_img_path);
    END LOOP;
    
    CLOSE v_img_cursor;
    SET v_done = FALSE;
  END IF;

  -- Insert multiple categories
  IF p_categories IS NOT NULL AND p_categories != '' THEN
    OPEN v_cat_cursor;
    
    cat_loop: LOOP
      FETCH v_cat_cursor INTO v_category_id;
      IF v_done THEN
        LEAVE cat_loop;
      END IF;
      
      INSERT INTO shoe_categories (shoe_id, shoe_category_id)
      VALUES (v_shoe_id, v_category_id);
    END LOOP;
    
    CLOSE v_cat_cursor;
  END IF;

  -- Commit transaction
  COMMIT;
  
  -- Return the created shoe ID
  SELECT v_shoe_id as shoe_id;

END$$
DELIMITER ;