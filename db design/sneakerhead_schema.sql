-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema sneakerhead
-- -----------------------------------------------------
-- Schema for Sneakerhead in ITDBADM Project - Group 5.
DROP SCHEMA IF EXISTS `sneakerhead` ;

-- -----------------------------------------------------
-- Schema sneakerhead
--
-- Schema for Sneakerhead in ITDBADM Project - Group 5.
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `sneakerhead` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
SHOW WARNINGS;
USE `sneakerhead` ;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_us_sizes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_us_sizes` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_us_sizes` (
  `shoe_size` DECIMAL(3,1) UNSIGNED NOT NULL,
  PRIMARY KEY (`shoe_size`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_ph_provinces`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_ph_provinces` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_ph_provinces` (
  `province_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `province_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`province_id`),
  UNIQUE INDEX `province_name_UNIQUE` (`province_name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_ph_cities_municipalities`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_ph_cities_municipalities` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_ph_cities_municipalities` (
  `city_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `city_name` VARCHAR(100) NOT NULL,
  `province_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`city_id`),
  INDEX `cmFK_provinces_idx` (`province_id` ASC) VISIBLE,
  CONSTRAINT `cmFK_provinces`
    FOREIGN KEY (`province_id`)
    REFERENCES `sneakerhead`.`ref_ph_provinces` (`province_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`addresses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`addresses` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`addresses` (
  `address_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `addressline1` VARCHAR(255) NOT NULL,
  `addressline2` VARCHAR(255) NULL,
  `city_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`address_id`),
  INDEX `addFK_city_idx` (`city_id` ASC) VISIBLE,
  CONSTRAINT `addFK_city`
    FOREIGN KEY (`city_id`)
    REFERENCES `sneakerhead`.`ref_ph_cities_municipalities` (`city_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`branches`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`branches` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`branches` (
  `branch_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_name` VARCHAR(100) NOT NULL,
  `address_id` INT UNSIGNED NOT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`branch_id`),
  INDEX `branchFK_address_idx` (`address_id` ASC) VISIBLE,
  CONSTRAINT `branchFK_address`
    FOREIGN KEY (`address_id`)
    REFERENCES `sneakerhead`.`addresses` (`address_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_shoe_categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_shoe_categories` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_shoe_categories` (
  `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`category_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_shoe_brands`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_shoe_brands` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_shoe_brands` (
  `brand_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `brand_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`brand_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_roles` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_roles` (
  `role_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE INDEX `role_name_UNIQUE` (`role_name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`users` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `pw_hash` VARCHAR(255) NOT NULL,
  `lname` VARCHAR(100) NOT NULL,
  `fname` VARCHAR(100) NOT NULL,
  `mname` VARCHAR(50) NULL,
  `address_id` INT UNSIGNED NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `usersFK_ref_roles_idx` (`role_id` ASC) VISIBLE,
  INDEX `usersFK_addresses_idx` (`address_id` ASC) VISIBLE,
  CONSTRAINT `usersFK_ref_roles`
    FOREIGN KEY (`role_id`)
    REFERENCES `sneakerhead`.`ref_roles` (`role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `usersFK_addresses`
    FOREIGN KEY (`address_id`)
    REFERENCES `sneakerhead`.`addresses` (`address_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`branch_admin_assignments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`branch_admin_assignments` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`branch_admin_assignments` (
  `branch_assignment` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `staff_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `role_at_branch` INT UNSIGNED NOT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at` DATETIME NULL,
  INDEX `sbaFK_branch_idx` (`branch_id` ASC) VISIBLE,
  INDEX `sbaFK_roles_idx` (`role_at_branch` ASC) VISIBLE,
  PRIMARY KEY (`branch_assignment`),
  UNIQUE INDEX `unassigned_at_UNIQUE` (`unassigned_at` ASC) VISIBLE,
  CONSTRAINT `sbaFK_staff`
    FOREIGN KEY (`staff_id`)
    REFERENCES `sneakerhead`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `sbaFK_branch`
    FOREIGN KEY (`branch_id`)
    REFERENCES `sneakerhead`.`branches` (`branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `sbaFK_roles`
    FOREIGN KEY (`role_at_branch`)
    REFERENCES `sneakerhead`.`ref_roles` (`role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shoes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shoes` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shoes` (
  `shoe_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `brand_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`shoe_id`),
  INDEX `shoesFK_brand_idx` (`brand_id` ASC) VISIBLE,
  CONSTRAINT `shoesFK_brand`
    FOREIGN KEY (`brand_id`)
    REFERENCES `sneakerhead`.`ref_shoe_brands` (`brand_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shoe_categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shoe_categories` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shoe_categories` (
  `shoe_id` INT UNSIGNED NOT NULL,
  `shoe_category_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`shoe_id`, `shoe_category_id`),
  INDEX `scFK_shoe_categories_idx` (`shoe_category_id` ASC) VISIBLE,
  CONSTRAINT `scFK_shoes`
    FOREIGN KEY (`shoe_id`)
    REFERENCES `sneakerhead`.`shoes` (`shoe_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `scFK_shoe_categories`
    FOREIGN KEY (`shoe_category_id`)
    REFERENCES `sneakerhead`.`ref_shoe_categories` (`category_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shoe_size_inventory`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shoe_size_inventory` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shoe_size_inventory` (
  `shoe_id` INT UNSIGNED NOT NULL,
  `shoe_us_size` DECIMAL(3,1) UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `stock` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`shoe_id`, `shoe_us_size`, `branch_id`),
  INDEX `ssiFK_shoesize_idx` (`shoe_us_size` ASC) VISIBLE,
  INDEX `ssiFK_branch_idx` (`branch_id` ASC) VISIBLE,
  INDEX `shoeid_branchid_idx` (`shoe_id` ASC, `branch_id` ASC) VISIBLE,
  CONSTRAINT `ssiFK_shoes`
    FOREIGN KEY (`shoe_id`)
    REFERENCES `sneakerhead`.`shoes` (`shoe_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ssiFK_shoesize`
    FOREIGN KEY (`shoe_us_size`)
    REFERENCES `sneakerhead`.`ref_us_sizes` (`shoe_size`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ssiFK_branch`
    FOREIGN KEY (`branch_id`)
    REFERENCES `sneakerhead`.`branches` (`branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shoe_images`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shoe_images` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shoe_images` (
  `img_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shoe_id` INT UNSIGNED NOT NULL,
  `img_path` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`img_id`),
  INDEX `siFK_shoes_idx` (`shoe_id` ASC) VISIBLE,
  CONSTRAINT `siFK_shoes`
    FOREIGN KEY (`shoe_id`)
    REFERENCES `sneakerhead`.`shoes` (`shoe_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`ref_currencies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`ref_currencies` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`ref_currencies` (
  `currency_code` CHAR(3) NOT NULL,
  `currency_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`currency_code`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shopping_cart`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shopping_cart` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shopping_cart` (
  `cart_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `currency_code` CHAR(3) NOT NULL DEFAULT 'PHP',
  `currency_rate_to_peso` DECIMAL(12,6) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (`cart_id`),
  INDEX `scFK_users_idx` (`user_id` ASC) VISIBLE,
  INDEX `scFK_branches_idx` (`branch_id` ASC) VISIBLE,
  INDEX `scFK_refcurrencies_idx` (`currency_code` ASC) VISIBLE,
  CONSTRAINT `scFK_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `sneakerhead`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `scFK_branches`
    FOREIGN KEY (`branch_id`)
    REFERENCES `sneakerhead`.`branches` (`branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `scFK_refcurrencies`
    FOREIGN KEY (`currency_code`)
    REFERENCES `sneakerhead`.`ref_currencies` (`currency_code`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`shopping_cart_items`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shopping_cart_items` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shopping_cart_items` (
  `cart_item_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_id` INT UNSIGNED NOT NULL,
  `shoe_id` INT UNSIGNED NOT NULL,
  `shoe_us_size` DECIMAL(3,1) UNSIGNED NOT NULL,
  `shoe_branch_id` INT UNSIGNED NOT NULL,
  `price_at_addition` DECIMAL(10,2) UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  INDEX `sciFK_cart_idx` (`cart_id` ASC) VISIBLE,
  INDEX `sciFK_shoesizeinventory_idx` (`shoe_id` ASC, `shoe_us_size` ASC, `shoe_branch_id` ASC) VISIBLE,
  CONSTRAINT `sciFK_cart`
    FOREIGN KEY (`cart_id`)
    REFERENCES `sneakerhead`.`shopping_cart` (`cart_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `sciFK_shoesizeinventory`
    FOREIGN KEY (`shoe_id` , `shoe_us_size` , `shoe_branch_id`)
    REFERENCES `sneakerhead`.`shoe_size_inventory` (`shoe_id` , `shoe_us_size` , `branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`promo_codes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`promo_codes` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`promo_codes` (
  `promo_code` VARCHAR(12) NOT NULL,
  `discount_type` ENUM('PERCENT', 'FIXED') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_value` DECIMAL(10,2) UNSIGNED NULL DEFAULT 0.00,
  `is_first_time_only` TINYINT(1) NULL DEFAULT 0,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `used_count` INT UNSIGNED NULL,
  `usage_limit` INT UNSIGNED NULL,
  `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`promo_code`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`orders` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`orders` (
  `order_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL COMMENT 'Note that, in the frontend, we will allow ordering from multiple branches, however, orders must only be one branch, so need ihiwalay',
  `promo_code` VARCHAR(12) NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `currency_code` CHAR(3) NOT NULL DEFAULT 'PHP',
  `currency_rate_to_peso` DECIMAL(12,6) NOT NULL DEFAULT 1.00,
  `total_price_conversion` DECIMAL(12,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  INDEX `ordersFK_branches_idx` (`branch_id` ASC) VISIBLE,
  INDEX `ordersFK_users_idx` (`user_id` ASC) VISIBLE,
  INDEX `ordersFK_promocodes_idx` (`promo_code` ASC) VISIBLE,
  INDEX `ordersFK_refcurrencies_idx` (`currency_code` ASC) VISIBLE,
  CONSTRAINT `ordersFK_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `sneakerhead`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ordersFK_branches`
    FOREIGN KEY (`branch_id`)
    REFERENCES `sneakerhead`.`branches` (`branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ordersFK_promocodes`
    FOREIGN KEY (`promo_code`)
    REFERENCES `sneakerhead`.`promo_codes` (`promo_code`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ordersFK_refcurrencies`
    FOREIGN KEY (`currency_code`)
    REFERENCES `sneakerhead`.`ref_currencies` (`currency_code`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`order_items`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`order_items` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`order_items` (
  `order_item_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `shoe_id` INT UNSIGNED NOT NULL,
  `shoe_size` DECIMAL(3,1) UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `price_at_purchase` DECIMAL(10,2) UNSIGNED NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  INDEX `oiFK_shoesizeinventory_idx` (`shoe_id` ASC, `shoe_size` ASC, `branch_id` ASC) VISIBLE,
  INDEX `oiFK_order_idx` (`order_id` ASC) VISIBLE,
  CONSTRAINT `oiFK_order`
    FOREIGN KEY (`order_id`)
    REFERENCES `sneakerhead`.`orders` (`order_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `oiFK_shoesizeinventory`
    FOREIGN KEY (`shoe_id` , `shoe_size` , `branch_id`)
    REFERENCES `sneakerhead`.`shoe_size_inventory` (`shoe_id` , `shoe_us_size` , `branch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`user_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`user_logs` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`user_logs` (
  `log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `role_id` INT UNSIGNED NULL,
  `action` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  INDEX `userlogs_FKusers_idx` (`user_id` ASC) VISIBLE,
  INDEX `userlogs_FKroles_idx` (`role_id` ASC) VISIBLE,
  CONSTRAINT `userlogs_FKusers`
    FOREIGN KEY (`user_id`)
    REFERENCES `sneakerhead`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `userlogs_FKroles`
    FOREIGN KEY (`role_id`)
    REFERENCES `sneakerhead`.`ref_roles` (`role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `sneakerhead`.`exchange_rates`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`exchange_rates` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`exchange_rates` (
  `currency_code` CHAR(3) NOT NULL,
  `rate_to_php` DECIMAL(12,6) NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`currency_code`),
  CONSTRAINT `erFK_refcurrencies`
    FOREIGN KEY (`currency_code`)
    REFERENCES `sneakerhead`.`ref_currencies` (`currency_code`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;
USE `sneakerhead` ;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`user_details_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`user_details_view` (`user_id` INT, `email` INT, `fname` INT, `mname` INT, `lname` INT, `role_id` INT, `role_name` INT, `address_id` INT, `addressline1` INT, `addressline2` INT, `city_id` INT, `city_name` INT, `province_id` INT, `province_name` INT, `created_at` INT, `updated_at` INT, `is_deleted` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`order_history_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`order_history_view` (`order_item_id` INT, `order_id` INT, `user_id` INT, `branch_id` INT, `branch_name` INT, `shoe_id` INT, `shoe_name` INT, `brand_name` INT, `size` INT, `quantity` INT, `price_at_purchase` INT, `subtotal` INT, `total_price` INT, `promo_code` INT, `image_path` INT, `order_created_at` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`orders_per_day`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`orders_per_day` (`day` INT, `month` INT, `year` INT, `sale_date` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`branch_daily_sales_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`branch_daily_sales_view` (`day` INT, `month` INT, `year` INT, `sale_date` INT, `branch_id` INT, `branch_name` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`orders_per_month`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`orders_per_month` (`month` INT, `year` INT, `period_start` INT, `period_end` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`branch_monthly_sales_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`branch_monthly_sales_view` (`month` INT, `year` INT, `period_start` INT, `period_end` INT, `branch_id` INT, `branch_name` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`orders_per_year`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`orders_per_year` (`year` INT, `period_start` INT, `period_end` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- Placeholder table for view `sneakerhead`.`branch_yearly_sales_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sneakerhead`.`branch_yearly_sales_view` (`year` INT, `period_start` INT, `period_end` INT, `branch_id` INT, `branch_name` INT, `total_sales` INT, `order_count` INT, `avg_order_value` INT, `orders_with_promo` INT, `promo_usage_rate` INT, `active_promo_codes` INT);
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`user_details_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`user_details_view`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`user_details_view` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE OR REPLACE VIEW user_details_view AS
SELECT
    u.user_id,
    u.email,
    u.fname,
    u.mname,
    u.lname,
    u.role_id,
    r.role_name,
    a.address_id,
    a.addressline1,
    a.addressline2,
    c.city_id,
    c.city_name,
    p.province_id,
    p.province_name,
    u.created_at,
    u.updated_at,
    u.is_deleted
FROM users u
LEFT JOIN addresses a
    ON u.address_id = a.address_id
LEFT JOIN ref_ph_cities_municipalities c
    ON a.city_id = c.city_id
LEFT JOIN ref_ph_provinces p
    ON c.province_id = p.province_id
LEFT JOIN ref_roles r
    ON u.role_id = r.role_id;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`order_history_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`order_history_view`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`order_history_view` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE OR REPLACE VIEW order_history_view AS
SELECT
    oi.order_item_id,
    oi.order_id,
    o.user_id,
    o.branch_id,
    b.branch_name,
    s.shoe_id,
    s.name AS shoe_name,
    sb.brand_name,
    oi.shoe_size AS size,
    oi.quantity,
    oi.price_at_purchase,
    oi.subtotal,
    o.total_price,
    o.promo_code, 
    si.main_image_path AS image_path,
    o.created_at AS order_created_at
FROM order_items oi
JOIN orders o 
    ON oi.order_id = o.order_id
JOIN branches b 
    ON o.branch_id = b.branch_id
JOIN shoes s 
    ON oi.shoe_id = s.shoe_id
JOIN ref_shoe_brands sb 
    ON s.brand_id = sb.brand_id
LEFT JOIN (
    SELECT 
        shoe_id,
        MIN(img_path) AS main_image_path
    FROM shoe_images
    GROUP BY shoe_id
) AS si 
    ON s.shoe_id = si.shoe_id;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`orders_per_day`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`orders_per_day`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`orders_per_day` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW orders_per_day AS
SELECT 
    DAY(o.created_at) AS day,
    MONTH(o.created_at) AS month,
    YEAR(o.created_at) AS year,
    DATE(o.created_at) as sale_date,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= sale_date
       AND (pc.end_date IS NULL OR pc.end_date >= sale_date)
    ) as active_promo_codes
FROM orders o
GROUP BY YEAR(o.created_at), MONTH(o.created_at), DAY(o.created_at), DATE(o.created_at)
ORDER BY year DESC, month DESC, day DESC;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`branch_daily_sales_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`branch_daily_sales_view`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`branch_daily_sales_view` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW branch_daily_sales_view AS
SELECT 
    DAY(o.created_at) AS day,
    MONTH(o.created_at) AS month,
    YEAR(o.created_at) AS year,
    DATE(o.created_at) as sale_date,
    b.branch_id,
    b.branch_name,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= sale_date
       AND (pc.end_date IS NULL OR pc.end_date >= sale_date)
    ) as active_promo_codes
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
GROUP BY YEAR(o.created_at), MONTH(o.created_at), DAY(o.created_at), DATE(o.created_at), b.branch_id, b.branch_name
ORDER BY year DESC, month DESC, day DESC, b.branch_name;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`orders_per_month`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`orders_per_month`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`orders_per_month` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW orders_per_month AS
SELECT 
    MONTH(o.created_at) AS month,
    YEAR(o.created_at) AS year,
    DATE_FORMAT(MIN(o.created_at), '%Y-%m-01') as period_start,
    LAST_DAY(DATE_FORMAT(MIN(o.created_at), '%Y-%m-01')) as period_end,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= LAST_DAY(DATE_FORMAT(MIN(o.created_at), '%Y-%m-01'))
       AND (pc.end_date IS NULL OR pc.end_date >= DATE_FORMAT(MIN(o.created_at), '%Y-%m-01'))
    ) as active_promo_codes
FROM orders o
GROUP BY YEAR(o.created_at), MONTH(o.created_at)
ORDER BY year DESC, month DESC;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`branch_monthly_sales_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`branch_monthly_sales_view`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`branch_monthly_sales_view` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW branch_monthly_sales_view AS
SELECT 
    MONTH(o.created_at) AS month,
    YEAR(o.created_at) AS year,
    DATE_FORMAT(MIN(o.created_at), '%Y-%m-01') as period_start,
    LAST_DAY(DATE_FORMAT(MIN(o.created_at), '%Y-%m-01')) as period_end,
    b.branch_id,
    b.branch_name,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= LAST_DAY(DATE_FORMAT(MIN(o.created_at), '%Y-%m-01'))
       AND (pc.end_date IS NULL OR pc.end_date >= DATE_FORMAT(MIN(o.created_at), '%Y-%m-01'))
    ) as active_promo_codes
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
GROUP BY YEAR(o.created_at), MONTH(o.created_at), b.branch_id, b.branch_name
ORDER BY year DESC, month DESC, b.branch_name;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`orders_per_year`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`orders_per_year`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`orders_per_year` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW orders_per_year AS
SELECT 
    YEAR(o.created_at) AS year,
    DATE_FORMAT(MIN(o.created_at), '%Y-01-01') as period_start,
    DATE_FORMAT(MIN(o.created_at), '%Y-12-31') as period_end,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= DATE_FORMAT(MIN(o.created_at), '%Y-12-31')
       AND (pc.end_date IS NULL OR pc.end_date >= DATE_FORMAT(MIN(o.created_at), '%Y-01-01'))
    ) as active_promo_codes
FROM orders o
GROUP BY YEAR(o.created_at)
ORDER BY year DESC;
SHOW WARNINGS;

-- -----------------------------------------------------
-- View `sneakerhead`.`branch_yearly_sales_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`branch_yearly_sales_view`;
SHOW WARNINGS;
DROP VIEW IF EXISTS `sneakerhead`.`branch_yearly_sales_view` ;
SHOW WARNINGS;
USE `sneakerhead`;
CREATE  OR REPLACE VIEW branch_yearly_sales_view AS
SELECT 
    YEAR(o.created_at) AS year,
    DATE_FORMAT(MIN(o.created_at), '%Y-01-01') as period_start,
    DATE_FORMAT(MIN(o.created_at), '%Y-12-31') as period_end,
    b.branch_id,
    b.branch_name,
    SUM(o.total_price) as total_sales,
    COUNT(*) as order_count,
    AVG(o.total_price) as avg_order_value,
    COUNT(o.promo_code) as orders_with_promo,
    ROUND((COUNT(o.promo_code) / COUNT(*)) * 100, 2) as promo_usage_rate,
    (SELECT COUNT(*) 
     FROM promo_codes pc 
     WHERE pc.start_date <= DATE_FORMAT(MIN(o.created_at), '%Y-12-31')
       AND (pc.end_date IS NULL OR pc.end_date >= DATE_FORMAT(MIN(o.created_at), '%Y-01-01'))
    ) as active_promo_codes
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
GROUP BY YEAR(o.created_at), b.branch_id, b.branch_name
ORDER BY year DESC, b.branch_name;
SHOW WARNINGS;
USE `sneakerhead`;

DELIMITER $$

USE `sneakerhead`$$
DROP TRIGGER IF EXISTS `sneakerhead`.`log_after_user_insert` $$
SHOW WARNINGS$$
USE `sneakerhead`$$
CREATE DEFINER = CURRENT_USER TRIGGER `sneakerhead`.`log_after_user_insert` 
AFTER INSERT ON `users` 
FOR EACH ROW
BEGIN
	INSERT INTO user_logs(user_id, role_id, action, description) VALUES
    (NEW.user_id, NEW.role_id, 'REGISTER_CUSTOMER', CONCAT('User ', NEW.fname, ' ', NEW.lname, ' registered.'));
END$$

SHOW WARNINGS$$

DELIMITER ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
