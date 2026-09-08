-- Arsip skema + data Pura Lempuyang Ticketing (MariaDB/MySQL).
--
-- CATATAN: berkas ini hanya cadangan/lampiran. Cara resmi menyiapkan database
-- adalah `php artisan migrate --seed` (lihat README). Data tabel transien
-- (sessions, cache, cache_locks, jobs, job_batches, failed_jobs) sengaja tidak
-- disertakan; strukturnya tetap dibuat.

-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: db_puralempuyang
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `db_puralempuyang`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_puralempuyang` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `db_puralempuyang`;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `ticket_type_id` bigint(20) unsigned DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `ticket_code` varchar(255) NOT NULL,
  `qr_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','valid','used','expired') NOT NULL DEFAULT 'pending',
  `validated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_items_ticket_code_unique` (`ticket_code`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_ticket_type_id_foreign` (`ticket_type_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_code` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `ticket_type_id` bigint(20) unsigned NOT NULL,
  `visit_slot_id` bigint(20) unsigned NOT NULL,
  `quantity` int(10) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','awaiting_payment','paid','expired','cancelled') NOT NULL DEFAULT 'pending',
  `payment_type` varchar(255) DEFAULT NULL,
  `snap_token` varchar(255) DEFAULT NULL,
  `snap_redirect_url` text DEFAULT NULL,
  `midtrans_order_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_code_unique` (`order_code`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_ticket_type_id_foreign` (`ticket_type_id`),
  KEY `orders_visit_slot_id_foreign` (`visit_slot_id`),
  CONSTRAINT `orders_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_visit_slot_id_foreign` FOREIGN KEY (`visit_slot_id`) REFERENCES `visit_slots` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_logs`
--

DROP TABLE IF EXISTS `payment_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_logs_order_id_foreign` (`order_id`),
  CONSTRAINT `payment_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `photo_assets`
--

DROP TABLE IF EXISTS `photo_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photo_assets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `photo_queue_entry_id` bigint(20) unsigned NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime` varchar(255) DEFAULT NULL,
  `size` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `photo_assets_photo_queue_entry_id_foreign` (`photo_queue_entry_id`),
  CONSTRAINT `photo_assets_photo_queue_entry_id_foreign` FOREIGN KEY (`photo_queue_entry_id`) REFERENCES `photo_queue_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `photo_points`
--

DROP TABLE IF EXISTS `photo_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photo_points` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `photo_queue_entries`
--

DROP TABLE IF EXISTS `photo_queue_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photo_queue_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `photo_point_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `queue_number` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'waiting',
  `called_at` timestamp NULL DEFAULT NULL,
  `served_at` timestamp NULL DEFAULT NULL,
  `finished_at` timestamp NULL DEFAULT NULL,
  `notified_at` timestamp NULL DEFAULT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `photo_queue_entries_photo_point_id_foreign` (`photo_point_id`),
  KEY `photo_queue_entries_order_id_foreign` (`order_id`),
  CONSTRAINT `photo_queue_entries_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `photo_queue_entries_photo_point_id_foreign` FOREIGN KEY (`photo_point_id`) REFERENCES `photo_points` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket_types`
--

DROP TABLE IF EXISTS `ticket_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `experience_code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` enum('domestic','international') NOT NULL DEFAULT 'domestic',
  `capacity` int(10) unsigned NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_types_experience_code_index` (`experience_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','operator','user') NOT NULL DEFAULT 'user',
  `phone` varchar(255) DEFAULT NULL,
  `citizenship_type` enum('domestic','international') NOT NULL DEFAULT 'domestic',
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visit_slots`
--

DROP TABLE IF EXISTS `visit_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visit_slots` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_type_id` bigint(20) unsigned NOT NULL,
  `visit_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `quota_total` int(10) unsigned NOT NULL,
  `quota_remaining` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visit_slots_ticket_type_id_foreign` (`ticket_type_id`),
  CONSTRAINT `visit_slots_ticket_type_id_foreign` FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed

-- Data
USE `db_puralempuyang`;
-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: db_puralempuyang
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` VALUES (4,'2025_11_12_191425_create_ticket_types_table',1);
INSERT INTO `migrations` VALUES (5,'2025_11_12_191431_create_visit_slots_table',1);
INSERT INTO `migrations` VALUES (6,'2025_11_12_191504_create_orders_table',1);
INSERT INTO `migrations` VALUES (7,'2025_11_12_191511_create_order_items_table',1);
INSERT INTO `migrations` VALUES (8,'2025_11_12_191518_create_payment_logs_table',1);
INSERT INTO `migrations` VALUES (9,'2025_11_13_165250_add_citizenship_type_to_users_table',1);
INSERT INTO `migrations` VALUES (10,'2025_11_13_165307_add_category_to_ticket_types_table',1);
INSERT INTO `migrations` VALUES (11,'2025_11_14_000000_update_ticket_type_prices',1);
INSERT INTO `migrations` VALUES (12,'2025_12_11_150000_create_photo_queue_tables',2);
INSERT INTO `migrations` VALUES (13,'2026_09_07_100000_add_experience_code_to_ticket_types_table',3);
INSERT INTO `migrations` VALUES (14,'2026_09_07_100100_add_pricing_to_order_items_table',3);
INSERT INTO `migrations` VALUES (15,'2026_09_07_100200_merge_duplicate_visit_slots',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin','admin@puralempuyang.com','admin',NULL,'domestic',NULL,NULL,'$2y$12$5DkIjIaw6XzGlA2mquyZ2.pUAPnKBU0rdAw0P6ox1G6dpj4kDXm6S',NULL,'2025-12-10 22:54:39','2026-09-07 07:01:21');
INSERT INTO `users` VALUES (3,'Petugas Gerbang','operator@puralempuyang.com','operator',NULL,'domestic',NULL,NULL,'$2y$12$5xZ7YhrUfZ6QMvAZIUWUCuoqfslRKCFo4uEBpMDR.EiMqfd8lwcEG',NULL,'2025-12-11 00:20:36','2026-09-07 07:01:21');
INSERT INTO `users` VALUES (12,'Mahesa','bs542980@gmail.com','user','081246599808','domestic',NULL,NULL,'$2y$12$LgCkxeuByp9mhjWDv.zlfuiYVVlnU1x0qRLEUrB/2a0UXknpLW5/q',NULL,'2026-09-07 22:33:40','2026-09-07 22:33:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ticket_types`
--

LOCK TABLES `ticket_types` WRITE;
/*!40000 ALTER TABLE `ticket_types` DISABLE KEYS */;
INSERT INTO `ticket_types` VALUES (1,'Sunrise Spiritual Journey','sunrise','Pengalaman pagi hari dengan pemandu lokal','domestic',80,30000.00,1,'2025-12-10 22:54:39','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (2,'Sunrise Spiritual Journey','sunrise','Pengalaman pagi hari dengan pemandu lokal','international',80,55000.00,1,'2025-12-10 22:54:39','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (3,'Golden Hour Experience','golden','Sesi sore hari dengan panorama matahari terbenam','domestic',60,30000.00,1,'2025-12-10 22:54:39','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (4,'Golden Hour Experience','golden','Sesi sore hari dengan panorama matahari terbenam','international',60,55000.00,1,'2025-12-10 22:54:39','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (5,'Gate of Heaven Sunrise','gate_of_heaven','Sesi ikonik di Candi Bentar saat matahari terbit, termasuk nomor antre foto prioritas','domestic',50,45000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (6,'Gate of Heaven Sunrise','gate_of_heaven','Sesi ikonik di Candi Bentar saat matahari terbit, termasuk nomor antre foto prioritas','international',50,85000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (7,'Lempuyang Luhur Pilgrimage','pilgrimage','Pendakian ke pura puncak bersama pemandu spiritual, termasuk persembahyangan','domestic',40,75000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (8,'Lempuyang Luhur Pilgrimage','pilgrimage','Pendakian ke pura puncak bersama pemandu spiritual, termasuk persembahyangan','international',40,150000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (9,'Twilight Blessing','twilight','Persembahyangan senja di pelataran utama dengan panorama Gunung Agung','domestic',40,35000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `ticket_types` VALUES (10,'Twilight Blessing','twilight','Persembahyangan senja di pelataran utama dengan panorama Gunung Agung','international',40,65000.00,1,'2026-09-07 07:01:21','2026-09-07 07:01:21');
/*!40000 ALTER TABLE `ticket_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `visit_slots`
--

LOCK TABLES `visit_slots` WRITE;
/*!40000 ALTER TABLE `visit_slots` DISABLE KEYS */;
INSERT INTO `visit_slots` VALUES (1,1,'2025-12-12','05:30:00','07:00:00',80,80,'2025-12-10 22:54:39','2025-12-10 22:54:39');
INSERT INTO `visit_slots` VALUES (3,1,'2025-12-12','07:00:00','08:30:00',80,80,'2025-12-10 22:54:39','2025-12-11 00:58:24');
INSERT INTO `visit_slots` VALUES (5,3,'2025-12-12','16:30:00','18:00:00',60,60,'2025-12-10 22:54:39','2025-12-10 22:54:39');
INSERT INTO `visit_slots` VALUES (9,1,'2026-09-08','05:30:00','07:00:00',80,78,'2026-09-07 07:01:21','2026-09-07 22:34:23');
INSERT INTO `visit_slots` VALUES (10,1,'2026-09-08','07:00:00','08:30:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (11,5,'2026-09-08','05:00:00','06:30:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:46:58');
INSERT INTO `visit_slots` VALUES (12,5,'2026-09-08','06:30:00','08:00:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (13,7,'2026-09-08','06:00:00','12:00:00',40,40,'2026-09-07 07:01:21','2026-09-07 22:40:39');
INSERT INTO `visit_slots` VALUES (14,9,'2026-09-08','18:00:00','19:30:00',40,39,'2026-09-07 07:01:21','2026-09-07 22:36:02');
INSERT INTO `visit_slots` VALUES (15,3,'2026-09-08','16:30:00','18:00:00',60,60,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (16,1,'2026-09-09','05:30:00','07:00:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (17,1,'2026-09-09','07:00:00','08:30:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (18,5,'2026-09-09','05:00:00','06:30:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (19,5,'2026-09-09','06:30:00','08:00:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (20,7,'2026-09-09','06:00:00','12:00:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (21,9,'2026-09-09','18:00:00','19:30:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (22,3,'2026-09-09','16:30:00','18:00:00',60,60,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (23,1,'2026-09-10','05:30:00','07:00:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (24,1,'2026-09-10','07:00:00','08:30:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (25,5,'2026-09-10','05:00:00','06:30:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (26,5,'2026-09-10','06:30:00','08:00:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (27,7,'2026-09-10','06:00:00','12:00:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (28,9,'2026-09-10','18:00:00','19:30:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (29,3,'2026-09-10','16:30:00','18:00:00',60,60,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (30,1,'2026-09-11','05:30:00','07:00:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (31,1,'2026-09-11','07:00:00','08:30:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (32,5,'2026-09-11','05:00:00','06:30:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (33,5,'2026-09-11','06:30:00','08:00:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (34,7,'2026-09-11','06:00:00','12:00:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (35,9,'2026-09-11','18:00:00','19:30:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (36,3,'2026-09-11','16:30:00','18:00:00',60,60,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (37,1,'2026-09-12','05:30:00','07:00:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (38,1,'2026-09-12','07:00:00','08:30:00',80,80,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (39,5,'2026-09-12','05:00:00','06:30:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (40,5,'2026-09-12','06:30:00','08:00:00',50,50,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (41,7,'2026-09-12','06:00:00','12:00:00',40,40,'2026-09-07 07:01:21','2026-09-07 07:01:21');
INSERT INTO `visit_slots` VALUES (42,9,'2026-09-12','18:00:00','19:30:00',40,40,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (43,3,'2026-09-12','16:30:00','18:00:00',60,60,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (44,1,'2026-09-13','05:30:00','07:00:00',80,80,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (45,1,'2026-09-13','07:00:00','08:30:00',80,80,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (46,5,'2026-09-13','05:00:00','06:30:00',50,50,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (47,5,'2026-09-13','06:30:00','08:00:00',50,50,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (48,7,'2026-09-13','06:00:00','12:00:00',40,40,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (49,9,'2026-09-13','18:00:00','19:30:00',40,40,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (50,3,'2026-09-13','16:30:00','18:00:00',60,60,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (51,1,'2026-09-14','05:30:00','07:00:00',80,80,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (52,1,'2026-09-14','07:00:00','08:30:00',80,80,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (53,5,'2026-09-14','05:00:00','06:30:00',50,50,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (54,5,'2026-09-14','06:30:00','08:00:00',50,50,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (55,7,'2026-09-14','06:00:00','12:00:00',40,40,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (56,9,'2026-09-14','18:00:00','19:30:00',40,40,'2026-09-07 07:01:22','2026-09-07 07:01:22');
INSERT INTO `visit_slots` VALUES (57,3,'2026-09-14','16:30:00','18:00:00',60,60,'2026-09-07 07:01:22','2026-09-07 07:01:22');
/*!40000 ALTER TABLE `visit_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (14,'PL-20260908-XGUCVHUI',12,1,9,1,30000.00,'paid','bank_transfer','a6dc103a-36c8-4fba-a00c-fd25a631232c','https://app.sandbox.midtrans.com/snap/v4/redirection/a6dc103a-36c8-4fba-a00c-fd25a631232c','425f93dd-f9b5-4931-b5a6-8e8f5493d101','2026-09-07 22:34:47','2026-09-07 22:34:21','2026-09-07 22:34:47');
INSERT INTO `orders` VALUES (15,'PL-20260908-JWYPIH3I',12,1,9,1,30000.00,'paid','bank_transfer','402432ab-cbc4-45e1-afa2-b7944b250164','https://app.sandbox.midtrans.com/snap/v4/redirection/402432ab-cbc4-45e1-afa2-b7944b250164','62005d2b-fe84-44cb-8f31-74a9511e2c7d','2026-09-07 22:35:20','2026-09-07 22:34:23','2026-09-07 22:35:20');
INSERT INTO `orders` VALUES (16,'PL-20260908-LWWXG3BB',12,7,13,1,75000.00,'expired',NULL,'a4768001-be76-4ce9-966d-371c7d2b2819','https://app.sandbox.midtrans.com/snap/v4/redirection/a4768001-be76-4ce9-966d-371c7d2b2819',NULL,NULL,'2026-09-07 22:35:34','2026-09-07 22:40:39');
INSERT INTO `orders` VALUES (17,'PL-20260908-ZUYYLMGN',12,9,14,1,35000.00,'paid','bank_transfer','5cb6cffb-4b45-4342-ac2d-53f637fa5ab2','https://app.sandbox.midtrans.com/snap/v4/redirection/5cb6cffb-4b45-4342-ac2d-53f637fa5ab2','250eca32-ddba-4bc6-aeb6-4d3b28e4bbd9','2026-09-07 22:36:13','2026-09-07 22:36:02','2026-09-07 22:36:13');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (35,14,1,30000.00,'7E99CDFA-A3AC-4839-B4CD-02BE17BA05D7','qrcodes/7E99CDFA-A3AC-4839-B4CD-02BE17BA05D7.svg','valid',NULL,'2026-09-07 22:34:21','2026-09-07 22:34:48');
INSERT INTO `order_items` VALUES (36,15,1,30000.00,'CA784062-7319-4FF8-8F58-96A86312B173','qrcodes/CA784062-7319-4FF8-8F58-96A86312B173.svg','used','2026-09-07 22:41:05','2026-09-07 22:34:23','2026-09-07 22:41:05');
INSERT INTO `order_items` VALUES (37,16,7,75000.00,'3E7D331E-03A0-48A3-AECD-40D558A9DC57',NULL,'expired',NULL,'2026-09-07 22:35:34','2026-09-07 22:40:39');
INSERT INTO `order_items` VALUES (38,17,9,35000.00,'F416585E-3E5D-481B-B412-999F82A37674','qrcodes/F416585E-3E5D-481B-B412-999F82A37674.svg','used','2026-09-07 22:39:39','2026-09-07 22:36:02','2026-09-07 22:39:39');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payment_logs`
--

LOCK TABLES `payment_logs` WRITE;
/*!40000 ALTER TABLE `payment_logs` DISABLE KEYS */;
INSERT INTO `payment_logs` VALUES (4,14,'{\"status_code\":\"200\",\"transaction_id\":\"425f93dd-f9b5-4931-b5a6-8e8f5493d101\",\"custom_field1\":\"2026-09-08\",\"custom_field2\":\"05:30:00\",\"gross_amount\":\"30000.00\",\"currency\":\"IDR\",\"order_id\":\"PL-20260908-XGUCVHUI\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"b0258c45f470544edec1f3695df0ee18474446de2828a1a7d8fa0325e89c0c9ccf0098157f9041b581812193f860fc560ccc492ece5ca8bd59ed0efe29bd9925\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G563335449\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"35449850865086953173596\"}],\"payment_amounts\":[],\"transaction_time\":\"2026-09-08 14:34:24\",\"settlement_time\":\"2026-09-08 14:34:43\",\"expiry_time\":\"2026-09-09 14:34:24\"}','2026-09-07 22:34:47','2026-09-07 22:34:47');
INSERT INTO `payment_logs` VALUES (5,15,'{\"status_code\":\"200\",\"transaction_id\":\"62005d2b-fe84-44cb-8f31-74a9511e2c7d\",\"custom_field1\":\"2026-09-08\",\"custom_field2\":\"05:30:00\",\"gross_amount\":\"30000.00\",\"currency\":\"IDR\",\"order_id\":\"PL-20260908-JWYPIH3I\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"a60595d1b1e268cff06c00c227948b0564653697f6ba7331013e3f9273ee8f6071d4d2f892307760fd7bf36a2fd4e0839cc0b6a9025594e4170f9bffef6cbeca\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G563335449\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"35449851486501934505893\"}],\"payment_amounts\":[],\"transaction_time\":\"2026-09-08 14:35:09\",\"settlement_time\":\"2026-09-08 14:35:14\",\"expiry_time\":\"2026-09-09 14:35:09\"}','2026-09-07 22:35:20','2026-09-07 22:35:20');
INSERT INTO `payment_logs` VALUES (6,17,'{\"status_code\":\"200\",\"transaction_id\":\"250eca32-ddba-4bc6-aeb6-4d3b28e4bbd9\",\"custom_field1\":\"2026-09-08\",\"custom_field2\":\"18:00:00\",\"gross_amount\":\"35000.00\",\"currency\":\"IDR\",\"order_id\":\"PL-20260908-ZUYYLMGN\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"50df2c2420d5827fa06f3b3253d291fa2686219aab6a44de93f791ff052cfba4988ad1655ddfc794b7bfd181fe797e5bc5ee057c90ff3bda3e29b365a621b866\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G563335449\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"35449931793875397938680\"}],\"payment_amounts\":[],\"transaction_time\":\"2026-09-08 14:36:04\",\"settlement_time\":\"2026-09-08 14:36:09\",\"expiry_time\":\"2026-09-09 14:36:04\"}','2026-09-07 22:36:13','2026-09-07 22:36:13');
/*!40000 ALTER TABLE `payment_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `photo_points`
--

LOCK TABLES `photo_points` WRITE;
/*!40000 ALTER TABLE `photo_points` DISABLE KEYS */;
INSERT INTO `photo_points` VALUES (1,'Gate of Heaven','Pura Lempuyang - Spot Utama',1,'2025-12-11 00:20:36','2026-09-07 07:01:22');
/*!40000 ALTER TABLE `photo_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `photo_queue_entries`
--

LOCK TABLES `photo_queue_entries` WRITE;
/*!40000 ALTER TABLE `photo_queue_entries` DISABLE KEYS */;
INSERT INTO `photo_queue_entries` VALUES (4,1,17,1,'2026-09-08','done','2026-09-07 22:42:27','2026-09-07 22:42:32','2026-09-07 22:42:36',NULL,NULL,'2026-09-07 22:42:07','2026-09-07 22:42:36');
/*!40000 ALTER TABLE `photo_queue_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `photo_assets`
--

LOCK TABLES `photo_assets` WRITE;
/*!40000 ALTER TABLE `photo_assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `photo_assets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
