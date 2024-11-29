create database cybergame;
use cybergame;

-- SET SQL_SAFE_UPDATES=0;

CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
  `username` VARCHAR(50),
  `password` VARCHAR(255),
  `phone` VARCHAR(255),
  `email` VARCHAR(100),
  `user_type` TinyINT,
  `is_vip` TinyINT DEFAULT 0,
  `vip_start_date` DATE,
  `vip_end_date` DATE,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `room` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `room_name` VARCHAR(50),
  `status` VARCHAR(50),
  `position` VARCHAR(100),
  `image_url` TEXT,
  `capacity` INT,
  `price` INT,
  `description` TEXT
);

CREATE TABLE `desktop` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `room_id` INT,
  `desktop_name` VARCHAR(50) NOT NULL,
  `price` INT,
  `status` VARCHAR(50) NOT NULL,  -- 0: trống | 1: đang sử dụng
  `description` TEXT
);

CREATE TABLE `category` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_name` VARCHAR(100),
  `description`VARCHAR(255),
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `product` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `image_url` TEXT,
  `product_name` VARCHAR(100),
  `price` DECIMAL(10,2),
  `category_id` int,
  `description` TEXT,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `cart` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `product_id` INT,
  `quantity` INT,
  `type` TinyINT DEFAULT 0,
  `room_id` INT,
  `created_at` DATETIME DEFAULT NOW()
);
-- payment status 1 unpaid 2 paid
-- payment method 1 delivery 2 online 
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `total_money` DECIMAL(10,2) NOT NULL,
  `order_date` DATETIME DEFAULT NOW(),
  `status` VARCHAR(50) NOT NULL,
  `payment_method` TinyINT, 
  `payment_status` TinyINT,
  `description`VARCHAR(255),
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `order_detail` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2),
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `room_order_detail` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT,
  `room_id` INT,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME,
  `total_time` INT,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT NOW()
);

ALTER TABLE `cart` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `cart` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `cart` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `order_detail` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `order_detail` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `product` ADD FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);

ALTER TABLE `room_order_detail` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `room_order_detail` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`id`);

ALTER TABLE `desktop` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`id`);



SELECT 
    room.id,
    room.room_name, 
    room.capacity,
    COUNT(DISTINCT desktop.room_id) AS desktop_count,
    GROUP_CONCAT(
        CONCAT(
            DATE_FORMAT(rod.start_time, '%d-%m-%Y %H:%i')," - ",
             DATE_FORMAT(rod.end_time, '%d-%m-%Y %H:%i')
        ) SEPARATOR '; '
    ) AS booking_times
FROM cybergame.room
LEFT JOIN cybergame.desktop ON room.id = desktop.room_id
LEFT JOIN cybergame.room_order_detail rod ON room.id = rod.room_id
WHERE rod.start_time > NOW()
GROUP BY 
    room.id, 
    room.room_name, 
    room.capacity
ORDER BY room.id;