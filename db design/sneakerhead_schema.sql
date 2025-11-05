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
  `user_id` INT UNSIGNED NOT NULL,
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
  `branch_assignment` INT UNSIGNED NOT NULL,
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
-- Table `sneakerhead`.`shopping_cart`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sneakerhead`.`shopping_cart` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `sneakerhead`.`shopping_cart` (
  `cart_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`cart_id`),
  INDEX `scFK_users_idx` (`user_id` ASC) VISIBLE,
  INDEX `scFK_branches_idx` (`branch_id` ASC) VISIBLE,
  CONSTRAINT `scFK_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `sneakerhead`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `scFK_branches`
    FOREIGN KEY (`branch_id`)
    REFERENCES `sneakerhead`.`branches` (`branch_id`)
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
  `total_price` DECIMAL(12,2) NOT NULL,
  `promo_code` VARCHAR(12) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  INDEX `ordersFK_branches_idx` (`branch_id` ASC) VISIBLE,
  INDEX `ordersFK_users_idx` (`user_id` ASC) VISIBLE,
  INDEX `ordersFK_promocodes_idx` (`promo_code` ASC) VISIBLE,
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
  `log_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
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

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
