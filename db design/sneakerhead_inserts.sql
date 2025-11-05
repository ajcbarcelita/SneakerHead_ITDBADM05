/*
    List of tables to make inserts for:
    - branch_admin_assignments
    - order_items (di pa need for now)
    - orders (di pa need for now)
    - promo_codes
    - shoe_categories
    - shoe_images (di pa need for now)
    - shoes
    - shoe_size_inventory
    - shopping_cart (for each user, make a shopping cart for all branches)
    - shopping_cart_items
*/
USE sneakerhead;


-- address inserts for customers
INSERT INTO addresses (addressline1, addressline2, city_id)VALUES 
('2401 Taft Ave', 'Malate', 1616);
SHOW WARNINGS;


-- address inserts for branches
INSERT INTO addresses (addressline1, addressline2, city_id) VALUES 
('123 Aguinaldo Highway', 'Bayan Luma', 391),
('456 Ayala Avenue', 'Legaspi Village', 1617),
('789 Bradco Avenue', 'Aseana Business Park', 1626);

SHOW WARNINGS;


-- branches inserts
INSERT INTO branches (branch_name, address_id)
VALUES
('SneakerHead Imus', 2),
('SneakerHead Makati', 3),
('SneakerHead Aseana', 4);


-- ref_roles inserts
INSERT INTO `sneakerhead`.`ref_roles` (`role_name`) VALUES
('Admin'),
('Branch Manager'),
('Customer');
SHOW WARNINGS;


-- ref_shoe_brands inserts
INSERT INTO `sneakerhead`.`ref_shoe_brands` (`brand_name`) VALUES
('Nike'),
('Adidas'),
('New Balance'),
('ASICS'),
('HOKA'),
('Puma');
SHOW WARNINGS;


-- ref_shoe_categories inserts
INSERT INTO `sneakerhead`.`ref_shoe_categories` (`category_name`) VALUES
('Running'),
('Training'),
('Lifestyle'),
('Casual'),
('Limited Edition'),
('Men\'s'),
('Women\'s');
SHOW WARNINGS;


-- ref_us_sizes inserts
INSERT INTO `sneakerhead`.`ref_us_sizes` (`shoe_size`) VALUES
(6.0),
(6.5),
(7.0),
(7.5),
(8.0),
(8.5),
(9.0),
(9.5),
(10.0),
(10.5),
(11.0),
(11.5),
(12.0),


-- users inserts for admins and branch managers
INSERT INTO `sneakerhead`.`users` 
(`email`, `pw_hash`, `lname`, `fname`, `mname`, `address_id`,`role_id`)
VALUES
('aaron_barcelita@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$sQL0Mxcf1NytqyRhdxx6EA$HrIYspTnidsJrehH7WBylqAYjSc5VyfVfaLMvzhEyak', 'Barcelita', 'Aaron John', 'Chucas', NULL, 1),
('john_mendoza@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$F/7lo34xW5g869oTL5sdFw$sR78CqT1/aNjEcGjo/w82G36cwMvhyyXegShZPJZFVI', 'Mendoza', 'John Kirbie', 'Garcia', NULL,2),
('josh_cariaga@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$AOKE+pDGbFL08muN72tfyQ$c43JpgU9vZXeHxyS0keX3D6GHAAOzLuSFvZasH9scvM', 'Cariaga', 'Josh Enrico', 'Pesigan', NULL,2),
('joshua_nicolai_gonzales@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$5artkKLQ9w2gYvgiOZ/Y9Q$sOA7xbrSRUGSYkSPB9YdvPpBhRN49TPWAJQOmkskMt0', 'Gonzales', 'Joshua Nicolai', 'Herrera', NULL,2),
('kasane_teto@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$2Qz9521WNaiabskpksgq0A$82clm13kaMOZWYIljBRf5b+QFp8NOhT1YwWqaV+YoWI', 'Teto', 'Kasane', NULL, 1, 3),
('akita_neru@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$yCFPWHrGWNIe4WqYYnBYRw$zN7esMqcwcCGWelrcX0WwxGGJQbOpSGDcETxl7cVlbU', 'Neru', 'Akita', NULL, 1, 3),
('hatsune_miku@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$HAniNVgySRDOINOYvheGGQ$FZ1HzfEDKecxa0ggpmHdxoqenuFdj+Ddd+muUVR0A2A', 'Miku', 'Hatsune', NULL,1, 3);

SHOW WARNINGS;