-- Barcelita, Aaron's Stored Procedures

-- General SP to log user events
DELIMITER $$
CREATE PROCEDURE `sp_log_event`(
    IN p_user_id INT,
    IN p_role_id INT,
    IN p_action VARCHAR(50),
    IN p_description VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    INSERT INTO sneakerhead.user_logs (
        user_id,
        role_id,
        action,
        description,
        ip_address,
        created_at
    )
    VALUES (
        p_user_id,
        p_role_id,
        p_action,
        p_description,
        p_ip_address,
        NOW()
    );
END $$
DELIMITER ;

-- SP to get shoe info
DELIMITER $$
CREATE PROCEDURE getBasicShoeInfo(IN p_shoe_id INT)
BEGIN
    SELECT s.shoe_id, s.brand_id, b.brand_name, s.name, s.price
    FROM shoes s
    JOIN ref_shoe_brands b ON s.brand_id = b.brand_id
    WHERE s.shoe_id = p_shoe_id AND s.is_deleted = 0;
END$$
DELIMITER ;

-- SP to get categories a shoe belongs to
DELIMITER $$
CREATE PROCEDURE getShoeCategories(IN p_shoe_id INT)
BEGIN
    SELECT c.category_name
    FROM shoe_categories sc
    JOIN ref_shoe_categories c ON sc.shoe_category_id = c.category_id
    WHERE sc.shoe_id = p_shoe_id;
END$$
DELIMITER ;

-- Get all images for a shoe
DELIMITER $$
CREATE PROCEDURE getShoeImages(IN p_shoe_id INT)
BEGIN
    SELECT img_path
    FROM shoe_images
    WHERE shoe_id = p_shoe_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE getShoeSizes(IN p_shoe_id INT, IN p_branch_id INT)
BEGIN
    SELECT r.shoe_size AS size, IFNULL(ssi.stock, 0) AS stock
    FROM ref_us_sizes r
    LEFT JOIN shoe_size_inventory ssi 
        ON r.shoe_size = ssi.shoe_us_size 
       AND ssi.shoe_id = p_shoe_id 
       AND ssi.branch_id = p_branch_id
    ORDER BY r.shoe_size;
END$$
DELIMITER ;

-- not sure if I should use this SP for the cataogue page where we list all shoes available in a branch using cards which link to their product page
DELIMITER $$
CREATE PROCEDURE getShoesByBranch(IN p_branch_id INT)
BEGIN
    SELECT 
        s.shoe_id,
        s.name,
        b.brand_name,
        s.price,
        -- Optional: first image only
        (SELECT img_path 
         FROM shoe_images 
         WHERE shoe_id = s.shoe_id 
         LIMIT 1) AS thumbnail
    FROM shoes s
    JOIN ref_shoe_brands b 
        ON s.brand_id = b.brand_id
    WHERE s.is_deleted = 0
      AND EXISTS (
            SELECT 1 
            FROM shoe_size_inventory ssi
            WHERE ssi.shoe_id = s.shoe_id
              AND ssi.branch_id = p_branch_id
              AND ssi.stock > 0
      );
END$$
DELIMITER ;