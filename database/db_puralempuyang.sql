-- MySQL schema & seed for Pura Lempuyang Ticketing
CREATE DATABASE IF NOT EXISTS `puralempuyang` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `puralempuyang`;

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS payment_logs;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS visit_slots;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cache;
DROP TABLE IF EXISTS cache_locks;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS job_batches;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  role ENUM('admin','operator','user') DEFAULT 'user',
  phone VARCHAR(30) NULL,
  avatar VARCHAR(255) NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  payload LONGTEXT NOT NULL,
  last_activity INT NOT NULL,
  INDEX sessions_user_id_index(user_id),
  CONSTRAINT sessions_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ticket_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  capacity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE visit_slots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  quota_total INT NOT NULL,
  quota_remaining INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT visit_slots_ticket_type_id_foreign FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  visit_slot_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending','awaiting_payment','paid','expired','cancelled') DEFAULT 'pending',
  payment_type VARCHAR(50) NULL,
  snap_token VARCHAR(100) NULL,
  snap_redirect_url TEXT NULL,
  midtrans_order_id VARCHAR(100) NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT orders_ticket_type_id_foreign FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
  CONSTRAINT orders_visit_slot_id_foreign FOREIGN KEY (visit_slot_id) REFERENCES visit_slots(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  ticket_code VARCHAR(64) NOT NULL UNIQUE,
  qr_path VARCHAR(255) NULL,
  status ENUM('pending','valid','used','expired') DEFAULT 'pending',
  validated_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payment_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT payment_logs_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cache (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cache_locks (
  `key` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL,
  reserved_at INT UNSIGNED NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  INDEX jobs_queue_index(queue)
) ENGINE=InnoDB;

CREATE TABLE job_batches (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_jobs INT NOT NULL,
  pending_jobs INT NOT NULL,
  failed_jobs INT NOT NULL,
  failed_job_ids LONGTEXT NOT NULL,
  options MEDIUMTEXT NULL,
  cancelled_at INT NULL,
  created_at INT NOT NULL,
  finished_at INT NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;

-- Seed data
INSERT INTO users (name, email, role, phone, password, created_at, updated_at)
VALUES ('Super Admin', 'admin@puralempuyang.com', 'admin', NULL, '$2y$10$WppZArYrusS4x2QV/pk3XO2Fne5DE5ZTCDxbFzNw2K6Yqq/RSBksi', NOW(), NOW());

INSERT INTO ticket_types (id, name, description, capacity, price, is_active)
VALUES
  (1, 'Sunrise Spiritual Journey', 'Pengalaman pagi hari dengan pemandu lokal', 100, 30000, 1),
  (2, 'Golden Hour Experience', 'Sesi sore hari dengan panorama matahari terbenam', 80, 55000, 1);

INSERT INTO visit_slots (ticket_type_id, visit_date, start_time, end_time, quota_total, quota_remaining)
VALUES
  (1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '05:30:00', '07:00:00', 80, 80),
  (1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '08:30:00', 80, 80),
  (2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:30:00', '18:00:00', 60, 60);
