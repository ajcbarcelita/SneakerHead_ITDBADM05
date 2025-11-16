/*
    List of tables to make inserts for:
    - branch_admin_assignments
    - shoe_categories (add more later)
    - shoe_images (add more later)
    - shoes (add more later)
    - shoe_size_inventory 
    - shopping_cart (for each user, make a shopping cart for all branches)
*/

-- address inserts (first for customers), branches will follow
INSERT INTO addresses (addressline1, addressline2, city_id) VALUES
('2401 Taft Ave.', 'Malate', 1616),
('123 Aguinaldo Highway', 'Bayan Luma', 391),
('456 Ayala Avenue', 'Legaspi Village', 1617),
('789 Bradco Avenue', 'Aseana Business Park', 1626);

-- branches inserts
INSERT INTO branches (branch_name, address_id) VALUES
('SneakerHead Imus', 2),
('SneakerHead Makati', 3),
('SneakerHead Aseana', 4);

-- ref_roles inserts
INSERT INTO `sneakerhead`.`ref_roles` (`role_name`) VALUES
('Admin'),
('Branch Manager'),
('Customer');

-- ref_shoe_brands inserts
INSERT INTO `sneakerhead`.`ref_shoe_brands` (`brand_name`) VALUES
('Nike'),
('Adidas'),
('New Balance'),
('ASICS'),
('Puma'),
('Converse'),
('Vans'),
('Onitsuka Tiger'),
('Others');

-- ref_shoe_categories inserts
INSERT INTO `sneakerhead`.`ref_shoe_categories` (`category_name`) VALUES
('Running'),
('Training'),
('Lifestyle'),
('Casual'),
('Limited Edition'),
('Basketball'),
('Skate'),
('Outdoor'),
('Men\'s'),
('Women\'s'),
('Kids'),
('Unisex');

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
(12.0);

-- shoes inserts
INSERT INTO `sneakerhead`.`shoes`
(`brand_id`, `name`, `price`) VALUES
(1, "Air Jordan 1 Low - Tokyo 96", 6195.00),
(1, "Nike Vomero Premium", 12295.00),
(1, "KD18 \"Slim Reaper\" EP", 9095.00),
(1, "Nike Zoom Vomero 5", 9395.00),
(9, "Air Binays", 6767.00),
(9, "Vico Air Max", 2000.00);

-- shoe_images inserts
INSERT INTO `sneakerhead`.`shoe_images` 
(`shoe_id`, `img_path`) VALUES
(1, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763306438/airjordan1low_tokyo96_1_ymopkb.webp"),
(1, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763306459/airjordan1low_tokyo96_2_twaax4.webp"),
(2, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307414/nikevomero_2_sube2f.avif"),
(2, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307419/nikevomero_3_iciiwa.jpg"),
(3, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307901/KD18_SE_EP_gib9xi.avif"),
(3, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307903/KD18_SE_EP_1_zge9hz.avif"),
(3, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307905/KD18_SE_EP_2_jkisbk.avif"),
(4, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307901/KD18_SE_EP_gib9xi.avif"),
(4, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307903/KD18_SE_EP_1_zge9hz.avif"),
(4, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763307905/KD18_SE_EP_2_jkisbk.avif"),
(5, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763309073/airbinays_t0togf.jpg"),
(6, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763308577/shoes/opqgdlspj78xolelbsmg.jpg"),
(6, "https://res.cloudinary.com/dalvc6cds/image/upload/v1763308580/shoes/ndtqvhdvbltqzvuxxgou.jpg");

-- shoe_categories inserts for shoes
INSERT INTO `sneakerhead`.`shoe_categories`
(`shoe_id`, `shoe_category_id`) VALUES
(1, 3),
(1, 9),
(2, 1),
(2, 12),
(3, 6),
(3, 9),
(4, 1),
(4, 3),
(5, 1),
(5, 3),
(5, 5),
(5, 11),
(5, 12),
(6, 1),
(6, 3),
(6, 5),
(6, 11),
(6, 12);

-- shoe_size_inventory inserts
INSERT INTO `sneakerhead`.`shoe_size_inventory` (`shoe_id`, `shoe_us_size`, `branch_id`, `stock`) VALUES
(1, 7.5, 1, 10),
(1, 8.0, 1, 8),
(1, 8.5, 1, 12),
(1, 9.0, 2, 15),
(1, 9.5, 2, 10),
(1, 10.0, 2, 7),
(1, 8.5, 3, 6),
(1, 9.0, 3, 9),
(1, 9.5, 3, 5),
(2, 8.0, 1, 7),
(2, 8.5, 1, 5),
(2, 9.0, 1, 12),
(2, 9.5, 2, 10),
(2, 10.0, 2, 9),
(2, 10.5, 2, 6),
(2, 9.0, 3, 8),
(2, 9.5, 3, 10),
(2, 10.0, 3, 5),
(3, 7.5, 1, 6),
(3, 8.0, 1, 9),
(3, 8.5, 1, 7),
(3, 8.0, 2, 12),
(3, 8.5, 2, 10),
(3, 9.0, 2, 8),
(3, 8.5, 3, 5),
(3, 9.0, 3, 7),
(3, 9.5, 3, 6),
(4, 8.0, 1, 5),
(4, 8.5, 1, 6),
(4, 9.0, 1, 7),
(4, 8.5, 2, 9),
(4, 9.0, 2, 10),
(4, 9.5, 2, 6),
(4, 9.0, 3, 5),
(4, 9.5, 3, 7),
(4, 10.0, 3, 4),
(5, 6.5, 1, 8),
(5, 7.0, 1, 7),
(5, 7.5, 2, 10),
(5, 8.0, 2, 9),
(5, 8.5, 3, 5),
(5, 9.0, 3, 6),
(6, 6.0, 1, 4),
(6, 6.5, 1, 6),
(6, 7.0, 2, 5),
(6, 7.5, 2, 7),
(6, 8.0, 3, 3),
(6, 8.5, 3, 5);

-- users inserts for admins and branch managers
INSERT INTO `sneakerhead`.`users` 
(`email`, `pw_hash`, `lname`, `fname`, `mname`, `address_id`,`role_id`)
VALUES
('aaron_barcelita@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$sQL0Mxcf1NytqyRhdxx6EA$HrIYspTnidsJrehH7WBylqAYjSc5VyfVfaLMvzhEyak', 'Barcelita', 'Aaron John', 'Chucas', NULL, 1),
('john_mendoza@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$F/7lo34xW5g869oTL5sdFw$sR78CqT1/aNjEcGjo/w82G36cwMvhyyXegShZPJZFVI', 'Mendoza', 'John Kirbie', 'Garcia', NULL,2),
('josh_cariaga@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$AOKE+pDGbFL08muN72tfyQ$c43JpgU9vZXeHxyS0keX3D6GHAAOzLuSFvZasH9scvM', 'Cariaga', 'Josh Enrico', 'Pesigan', NULL,2),
('joshua_nicolai_gonzales@dlsu.edu.ph', '$argon2id$v=19$m=65536,t=5,p=1$5artkKLQ9w2gYvgiOZ/Y9Q$sOA7xbrSRUGSYkSPB9YdvPpBhRN49TPWAJQOmkskMt0', 'Gonzales', 'Joshua Nicolai', 'Herrera', NULL,2),
('kasane_teto@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$2Qz9521WNaiabskpksgq0A$82clm13kaMOZWYIljBRf5b+QFp8NOhT1YwWqaV+YoWI', 'Kasane', 'Teto', NULL, 1, 3),
('akita_neru@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$yCFPWHrGWNIe4WqYYnBYRw$zN7esMqcwcCGWelrcX0WwxGGJQbOpSGDcETxl7cVlbU', 'Akita', 'Neru', NULL, 1, 3),
('hatsune_miku@gmail.com', '$argon2id$v=19$m=65536,t=5,p=1$HAniNVgySRDOINOYvheGGQ$FZ1HzfEDKecxa0ggpmHdxoqenuFdj+Ddd+muUVR0A2A', 'Hatsune', 'Miku', NULL,1, 3);