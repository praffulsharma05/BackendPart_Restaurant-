-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restaurant
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_item_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `selected_options` text,
  `custom_instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customization_options`
--

DROP TABLE IF EXISTS `customization_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customization_options` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `customization_options_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

---- Dumping data for table `customization_options`
--

LOCK TABLES `customization_options` WRITE;
/*!40000 ALTER TABLE `customization_options` DISABLE KEYS */;
INSERT INTO `customization_options` VALUES ('0879dc63-f31f-41db-8a6c-eb69c8d06be7','m_bread_1','tandoori roti',15.00,0);
/*!40000 ALTER TABLE `customization_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_categories`
--

DROP TABLE IF EXISTS `menu_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_categories`
--

LOCK TABLES `menu_categories` WRITE;
/*!40000 ALTER TABLE `menu_categories` DISABLE KEYS */;
INSERT INTO `menu_categories` VALUES (15,'Non Veg Snacks','Tandoori, tikka, kebabs & fried delights',1,1),(16,'Non Veg Platter','Cocktail platters for sharing',2,1),(17,'Non Veg Roll','Stuffed rolls and wraps',3,1),(18,'Main Course','Rich curries and gravies',4,1),(19,'Biryani','Aromatic rice dishes',5,1),(20,'Momos','Steamed and fried dumplings',6,1),(21,'Party Pack','Family-size party packs',7,1),(22,'Veg Snacks','Paneer, soya chaap & veg starters',8,1),(23,'Veg Rolls','Vegetarian rolls and wraps',9,1),(24,'Soup','Warm soups',10,1),(25,'Breads','Naan, roti, paratha & kulcha',11,1);
/*!40000 ALTER TABLE `menu_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item_ingredients`
--

DROP TABLE IF EXISTS `menu_item_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_item_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ingredient_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `menu_item_ingredients_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item_ingredients`
--

LOCK TABLES `menu_item_ingredients` WRITE;
/*!40000 ALTER TABLE `menu_item_ingredients` DISABLE KEYS */;
/*!40000 ALTER TABLE `menu_item_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,2) DEFAULT '4.80',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_vegetarian` tinyint(1) DEFAULT '0',
  `is_hidden` tinyint(1) DEFAULT '0',
  `inventory_status` enum('AVAILABLE','SOLD_OUT') COLLATE utf8mb4_unicode_ci DEFAULT 'AVAILABLE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `prep_time_minutes` int DEFAULT '15',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_menu_items_status` (`inventory_status`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES ('m_bir_1',19,'Chicken Biryani','Fragrant basmati rice layered with spiced chicken and saffron',160.00,4.60,'Biryani','https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-06 11:16:46',0,30),('m_bir_2',19,'Mutton Biryani','Aromatic mutton biryani with tender meat and whole spices',200.00,4.70,'Biryani','https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-06 11:16:48',0,40),('m_bread_1',25,'Tandoori Butter Roti','Soft tandoori roti brushed with fresh butter',10.00,4.20,'Breads','https://www.allrecipes.com/thmb/qgfQljqLcHe4Zr_SMWzsB2Gd6E8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-85469-indian-chapati-bread-DDMFS-4x3-d2692c11f56b4546b35dccd42ace1958.jpg',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,5),('m_bread_2',25,'Naan','Classic soft naan baked in tandoor oven',25.00,4.30,'Breads','https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,5),('m_bread_3',25,'Garlic Naan','Fluffy naan topped with garlic and butter',37.00,4.50,'Breads','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,5),('m_bread_4',25,'Laccha Paratha','Layered flaky laccha paratha, crispy and buttery',25.00,4.30,'Breads','https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-06 11:16:51',0,8),('m_bread_5',25,'Masala Laccha Paratha','Spiced masala laccha paratha with herbs',30.00,4.40,'Breads','https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,8),('m_bread_6',25,'Khamiri Roti (Turkish Bread)','Traditional khamiri roti, soft and fluffy Turkish-style bread',16.00,4.20,'Breads','https://www.allrecipes.com/thmb/qgfQljqLcHe4Zr_SMWzsB2Gd6E8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-85469-indian-chapati-bread-DDMFS-4x3-d2692c11f56b4546b35dccd42ace1958.jpg',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,8),('m_bread_7',25,'Rumali Roti','Paper-thin rumali roti, delicate and light',13.00,4.10,'Breads','https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,5),('m_mc_1',18,'Egg Curry (3pcs)','Classic egg curry in rich tomato-onion gravy',160.00,4.10,'Main Course','https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_mc_10',18,'Kadhai Chicken','Kadhai-style chicken with bell peppers and tomatoes',250.00,4.50,'Main Course','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_mc_11',18,'Kali Mirchi Chicken Curry (Boneless 6 Pcs.)','Spicy black pepper boneless chicken curry',320.00,4.40,'Main Course','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_12',18,'Tawa Chicken','Tawa-fried chicken with onions, peppers and Indian spices',225.00,4.30,'Main Course','https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_mc_2',18,'Amritsari Chicken Curry (3pcs)','Authentic Amritsari-style chicken curry with bold spices',225.00,4.50,'Main Course','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_3',18,'Punjabi Mutton Curry (3pcs)','Slow-cooked Punjabi mutton curry with aromatic masala',320.00,4.70,'Main Course','https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,35),('m_mc_4',18,'Mutton Keema Kalegi','Minced mutton keema with liver, cooked with traditional spices',320.00,4.50,'Main Course','https://images.unsplash.com/photo-1574653853027-5382a3d23a15?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_5',18,'Chicken Bhartha','Smoky charcoal-roasted chicken mashed with spices',225.00,4.30,'Main Course','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_6',18,'Butter Chicken Curry (3pcs)','Creamy butter chicken in rich tomato-cashew gravy',250.00,4.80,'Main Course','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_7',18,'Chicken Tikka Masala','Grilled chicken tikka in spiced masala curry',300.00,4.60,'Main Course','https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_8',18,'Butter Chicken Tikka Masala','Premium butter chicken tikka in creamy masala sauce',320.00,4.70,'Main Course','https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_mc_9',18,'Mutton Kebab Masala','Seekh kebab pieces simmered in rich masala gravy',375.00,4.60,'Main Course','https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,30),('m_mom_1',20,'Roasted Chicken Momos','Pan-roasted chicken momos with spicy red chutney',125.00,4.30,'Momos','https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_mom_2',20,'Afgani Momos','Creamy Afgani-style momos with cashew cream sauce',175.00,4.40,'Momos','https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_mom_3',20,'Chilly Chicken Momos','Spicy chilly chicken momos tossed in Indo-Chinese sauce',200.00,4.50,'Momos','https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_nvp_1',16,'Chicken Tikka Cocktail','Assorted chicken tikka cocktail platter',225.00,4.50,'Non Veg Platter','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvp_2',16,'Chicken & Mutton Kebab Cocktail','Mixed chicken and mutton kebab platter for sharing',225.00,4.60,'Non Veg Platter','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvp_3',16,'Chicken & Leg Cocktail','Chicken tikka and roasted leg combo platter',290.00,4.40,'Non Veg Platter','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvp_4',16,'Chicken & Fish Cocktail','Chicken tikka and crispy fish combo platter',290.00,4.50,'Non Veg Platter','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvr_1',17,'Chicken Tikka Roll','Juicy chicken tikka wrapped in fresh paratha with chutney',160.00,4.30,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_nvr_2',17,'Mutton Roll','Tender mutton pieces wrapped in soft paratha',250.00,4.40,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-06 11:06:03',0,12),('m_nvr_3',17,'Mutton Kebab Roll','Seekh kebab roll with mint chutney and onions',210.00,4.50,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,12),('m_nvr_4',17,'Fish Roll','Crispy fried fish wrapped in paratha with tartar sauce',260.00,4.20,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,12),('m_nvr_5',17,'Afgani Chicken Roll','Creamy Afgani chicken tikka wrapped in butter paratha',280.00,4.40,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,12),('m_nvr_6',17,'Afgani Kebab Roll','Afgani-style seekh kebab roll with cream and herbs',280.00,4.50,'Non Veg Roll','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,12),('m_nvs_1',15,'Peshawari Chicken Tikka (6pcs)','Juicy chicken tikka marinated in Peshawari spices, charcoal grilled to perfection',225.00,4.50,'Non Veg Snacks','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_10',15,'Lemon Chicken (6pcs)','Tangy lemon-marinated chicken pieces, grilled to perfection',225.00,4.40,'Non Veg Snacks','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_11',15,'Mutton Tikka (8pcs)','Tender mutton tikka marinated in aromatic spices',225.00,4.50,'Non Veg Snacks','https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvs_12',15,'Mutton Seekh Kebab','Minced mutton seekh kebabs grilled on skewers with fresh herbs',320.00,4.60,'Non Veg Snacks','https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvs_13',15,'Roasted Fish (6pcs)','Fresh fish fillets roasted with Indian spices and lemon',320.00,4.30,'Non Veg Snacks','https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_14',15,'Fry Fish (8pcs)','Crispy deep-fried fish pieces with masala coating',320.00,4.20,'Non Veg Snacks','https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_nvs_15',15,'Chilly Chicken','Indo-Chinese style chilly chicken tossed with bell peppers',185.00,4.40,'Non Veg Snacks','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_nvs_16',15,'Chicken Lollipop','Crispy chicken lollipops with spicy glaze',185.00,4.50,'Non Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_nvs_17',15,'Sauted Chicken','Pan-sautéd chicken with onions, peppers and Indian spices',250.00,4.30,'Non Veg Snacks','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_nvs_18',15,'Sauted Mutton','Tender mutton pieces sautéd with aromatic spices',320.00,4.40,'Non Veg Snacks','https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_2',15,'Afgani Chicken Tikka (6pcs)','Creamy Afgani-style chicken tikka with cashew and cream marinade',225.00,4.40,'Non Veg Snacks','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_3',15,'Malai Chicken Tikka (6pcs)','Soft and creamy malai chicken tikka with a rich, buttery flavor',250.00,4.60,'Non Veg Snacks','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_4',15,'Kaali Mirch Chicken Tikka (6pcs)','Bold black pepper chicken tikka with a spicy kick',250.00,4.30,'Non Veg Snacks','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,20),('m_nvs_5',15,'Roasted Jumbo Chicken Legs','Jumbo chicken legs roasted with Indian spices until crispy',160.00,4.20,'Non Veg Snacks','https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvs_6',15,'Tandoori Chicken (Full)','Full tandoori chicken, slow-cooked in clay oven with yogurt marinade',420.00,4.70,'Non Veg Snacks','https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,30),('m_nvs_7',15,'Butter Tandoori Chicken','Premium butter-basted tandoori chicken, extra juicy and flavorful',520.00,4.80,'Non Veg Snacks','https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,30),('m_nvs_8',15,'Kaali Mirch Jumbo Legs','Jumbo chicken legs with bold black pepper seasoning',180.00,4.30,'Non Veg Snacks','https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,25),('m_nvs_9',15,'Fried Chicken Pakora (8pcs)','Crispy fried chicken pakoras, perfect as a tea-time snack',185.00,4.10,'Non Veg Snacks','https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_pp_1',21,'Amritsari Chicken Curry (Party Pack)','Family-size Amritsari chicken curry, serves 4-6',625.00,4.50,'Party Pack','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,35),('m_pp_2',21,'Punjabi Mutton Curry (Party Pack)','Family-size Punjabi mutton curry, serves 4-6',625.00,4.60,'Party Pack','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,40),('m_pp_3',21,'Keema Kalegi (Party Pack)','Family-size keema kalegi, serves 6-8',1250.00,4.50,'Party Pack','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,35),('m_pp_4',21,'Butter Chicken Curry (Party Pack)','Family-size butter chicken curry, serves 4-6',875.00,4.70,'Party Pack','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,35),('m_soup_1',24,'Chicken Soup','Hot and comforting chicken soup with herbs',50.00,4.10,'Soup','https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_soup_2',24,'Mutton Paya Soup','Traditional slow-cooked mutton paya soup, rich and hearty',85.00,4.30,'Soup','https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',0,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vroll_1',23,'Soya Chaap Roll','Grilled soya chaap wrapped in paratha with chutney',125.00,4.20,'Veg Rolls','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_vroll_2',23,'Paneer Tikka Roll','Paneer tikka roll with mint chutney and onions',125.00,4.30,'Veg Rolls','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_vroll_3',23,'Afgani Chaap Roll','Creamy Afgani chaap wrapped in butter paratha',145.00,4.40,'Veg Rolls','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_vroll_4',23,'Afgani Paneer Roll','Afgani paneer tikka roll with cream and herbs',150.00,4.40,'Veg Rolls','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,10),('m_vsnack_1',22,'Paneer Tikka','Cottage cheese tikka marinated in spices, charcoal grilled',125.00,4.40,'Veg Snacks','https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_2',22,'Soya Chaap','Grilled soya chaap with tandoori marinade',125.00,4.30,'Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_3',22,'Lemon Soya Chaap','Tangy lemon-marinated soya chaap, grilled fresh',125.00,4.20,'Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_4',22,'Afgani Soya Chaap','Creamy Afgani-style soya chaap with cashew marinade',140.00,4.40,'Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_5',22,'Afgani Paneer Tikka','Afgani paneer tikka with cream and cashew coating',140.00,4.50,'Veg Snacks','https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_6',22,'Tawa Chaap Curry','Tawa-fried soya chaap in spicy curry sauce',185.00,4.30,'Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_7',22,'Chilly Paneer','Indo-Chinese chilly paneer with bell peppers and onions',175.00,4.50,'Veg Snacks','https://images.unsplash.com/photo-1631452180775-d7eb3a1e9ecf?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15),('m_vsnack_8',22,'Tandoori Soya Chaap','Tandoori soya chaap grilled in clay oven',175.00,4.30,'Veg Snacks','https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',1,0,'AVAILABLE','2026-08-04 13:42:37','2026-08-04 13:42:37',0,15);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'GENERAL',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('461eaa69-0a33-430e-9065-a5e30595e314','admin_1785418118910','Order Placed Successfully','Your order #ORD_1786 has been placed and is pending admin approval.','order',1,'2026-08-06 11:17:38'),('4bfa37d3-3c85-4f16-95cf-1497dc3085b9','admin_1785418118910','Order Placed Successfully','Your order #ORD_1786 has been placed and is pending admin approval.','order',0,'2026-08-06 10:51:56'),('84ecfdc6-d840-40b7-825c-f530645a026e','admin_1785418118910','Order Placed Successfully','Your order #ORD_1786 has been placed and is pending admin approval.','order',1,'2026-08-06 10:37:27'),('d95d80e7-e3c0-4c20-96ac-a420c677d502','admin_1785418118910','Order Placed Successfully','Your order #ORD_1786 has been placed and is pending admin approval.','order',1,'2026-08-06 10:50:51'),('ee082c5a-5234-4ef7-acf4-a3128026b0fd','admin_1785418118910','Order Cancelled','Your order was cancelled. Reason: Kitchen busy / Item out of stock','order',1,'2026-08-06 10:38:32');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `offer_type` enum('PERCENTAGE','FLAT','FIRST_ORDER','CASHBACK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT '0.00',
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES ('75392b9f-250a-4183-a1bb-3b15fa898ed6','FESRT','Bingo222222 ','44242 dfvfv f bk,bkm','FLAT',49.00,0.00,499.00,0.00,NULL,1,'2026-08-04 11:35:46'),('d44456a9-8274-4c5a-bb17-a393d6c2a3e3','FESRIVAL20','20% cashback','20% off','FLAT',20.00,0.00,99.00,0.00,NULL,1,'2026-08-06 07:55:44');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_fulfillment_car`
--

DROP TABLE IF EXISTS `order_fulfillment_car`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_fulfillment_car` (
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `car_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `car_model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parking_spot` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  CONSTRAINT `order_fulfillment_car_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_fulfillment_car`
--

LOCK TABLES `order_fulfillment_car` WRITE;
/*!40000 ALTER TABLE `order_fulfillment_car` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_fulfillment_car` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_fulfillment_dine_in`
--

DROP TABLE IF EXISTS `order_fulfillment_dine_in`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_fulfillment_dine_in` (
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  CONSTRAINT `order_fulfillment_dine_in_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_fulfillment_dine_in`
--

LOCK TABLES `order_fulfillment_dine_in` WRITE;
/*!40000 ALTER TABLE `order_fulfillment_dine_in` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_fulfillment_dine_in` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_fulfillment_pre_order`
--

DROP TABLE IF EXISTS `order_fulfillment_pre_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_fulfillment_pre_order` (
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  PRIMARY KEY (`order_id`),
  CONSTRAINT `order_fulfillment_pre_order_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_fulfillment_pre_order`
--

LOCK TABLES `order_fulfillment_pre_order` WRITE;
/*!40000 ALTER TABLE `order_fulfillment_pre_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_fulfillment_pre_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item_options`
--

DROP TABLE IF EXISTS `order_item_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `option_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `order_item_id` (`order_item_id`),
  CONSTRAINT `order_item_options_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item_options`
--

LOCK TABLES `order_item_options` WRITE;
/*!40000 ALTER TABLE `order_item_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_item_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `subtotal` decimal(10,2) NOT NULL,
  `custom_instructions` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('f86bf00f-007b-4a41-ada3-6dcc95c928d5','ord_1786015058758','m_nvs_6','Tandoori Chicken (Full)',420.00,1,420.00,'');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Delivery',
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `service_charge` decimal(10,2) DEFAULT '0.00',
  `reward_points_earned` int DEFAULT '0',
  `reward_points_used` int DEFAULT '0',
  `total` decimal(10,2) NOT NULL,
  `status` enum('Pending','Accepted','Preparing','Ready','Served','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `prep_time_minutes` int DEFAULT '20',
  `payment_method` enum('QR Scan','Card','Cash','UPI') COLLATE utf8mb4_unicode_ci DEFAULT 'QR Scan',
  `payment_status` enum('PENDING','PAID','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `cancellation_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `coupon_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_screenshot_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('ord_1786015058758','admin_1785418118910','Pickup',420.00,0.00,21.00,10.50,451,0,451.50,'Pending',30,'UPI','PAID',NULL,'2026-08-06 11:17:38','2026-08-06 11:17:38',NULL,'https://res.cloudinary.com/dekctt0su/image/upload/v1786015060/payment_screenshots/tckka9xmje1icaoifiul.png');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('04abb26a-fa5f-4604-bb60-d4d24580476d','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTc4Nzg2MDY5MzciLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEiLCJpYXQiOjE3ODYwMTM4MzksImV4cCI6MTc4NjYxODYzOX0.zjvShPvcLD7hTztzjS0BinEf1lmGU4RbvT-bX96ZZU8','2026-08-13 16:27:19','2026-08-06 10:57:19'),('1af103d8-b662-43ce-91ed-d859af9a739b','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NTQxODExOCwiZXhwIjoxNzg2MDIyOTE4fQ.F_ogEEfDmXzl_2ckqF3EKikLGi7CUo2DJm9hvHIt9q8','2026-08-06 18:58:39','2026-07-30 13:28:38'),('2ce78c4b-5b0e-429d-9337-9346c84cb95a','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NjAxMTc3OCwiZXhwIjoxNzg2NjE2NTc4fQ.k4m050IrgPdgofrCV7LTG1zfX9F1s0Tipmpg1LLH2JE','2026-08-13 15:52:59','2026-08-06 10:22:58'),('33002430-0e11-4679-95b3-cc41fe5a8483','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NTU4MzIxOCwiZXhwIjoxNzg2MTg4MDE4fQ.QKrHKCpkWH8eutC9k4Y9t0b0LHC4-tlM_IwKNMO3LI0','2026-08-08 16:50:19','2026-08-01 11:20:18'),('4451a5c9-551b-4422-9d5b-b7b5cfa19646','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTc4Nzg2MDY5MzciLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NjAxNDE5MiwiZXhwIjoxNzg2NjE4OTkyfQ.XAcVy3CFme6hOE90NhxwZCFw9bfyQxTpzukozngNupM','2026-08-13 16:33:12','2026-08-06 11:03:12'),('593c581b-9fbf-4528-8896-0a23c41a6666','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NjAwMTk5NSwiZXhwIjoxNzg2NjA2Nzk1fQ.DI3wUxjhw3GpbIcwtH_MjzOsnqjc_Wf5-nTrcAN6-PQ','2026-08-13 13:09:55','2026-08-06 07:39:55'),('61e47a7e-c4f1-4890-8531-044ae52a7e4f','u_admin2','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVfYWRtaW4yIiwicGhvbmUiOiIrOTE5ODc2NTQzMjEwIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc4NTU4MzIxMSwiZXhwIjoxNzg2MTg4MDExfQ.5mVZppZrbC-spLFd0I_n0kTNONzQhNgwxy2oOarD2Lo','2026-08-08 16:50:12','2026-08-01 11:20:11'),('a261eabb-e287-4587-8616-0ca20f7b7b52','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NTY5Nzc0MSwiZXhwIjoxNzg2MzAyNTQxfQ.4G6QLNMdxxDYpnuIzr3yvdUcxGneH4eduJhCPGyS56w','2026-08-10 00:39:01','2026-08-02 19:09:01'),('b2beff3c-0c97-431d-92ec-022c7c60a882','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NTc4NjEwNywiZXhwIjoxNzg2MzkwOTA3fQ.4ILxiqJq7El2kVtEb5uU4WO_Vg-yxZ8jLFlVyZluOKw','2026-08-11 01:11:47','2026-08-03 19:41:47'),('da54976c-96b1-45db-8e83-08a09017a2ed','admin_1785418118910','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3ODU0MTgxMTg5MTAiLCJwaG9uZSI6Iis5MTk5OTk5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiUHJhZmZ1bCBTaGFybWEgKFN1cGVyIEFkbWluKSIsImlhdCI6MTc4NTUwNjE3OSwiZXhwIjoxNzg2MTEwOTc5fQ.vPQXZdgb75GpB59MdEumZ4E7p6CfAbtS4qLMabWEW3g','2026-08-07 19:26:20','2026-07-31 13:56:19');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_info`
--

DROP TABLE IF EXISTS `restaurant_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Luxe Dine',
  `logo_url` longtext COLLATE utf8mb4_unicode_ci,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '+1 800-589-3463',
  `address` text COLLATE utf8mb4_unicode_ci,
  `tax_percentage` decimal(5,2) DEFAULT '5.00',
  `service_charge_percentage` decimal(5,2) DEFAULT '2.50',
  `upi_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'luxedine@bank',
  `qr_payment_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Gourmet Dining Experience',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_info`
--

LOCK TABLES `restaurant_info` WRITE;
/*!40000 ALTER TABLE `restaurant_info` DISABLE KEYS */;
INSERT INTO `restaurant_info` VALUES (1,'Meals on wheels ','https://res.cloudinary.com/dekctt0su/image/upload/v1785416979/restaurant_logos/mywhqmggkjqlirfpuxmo.png','+917878606937','Raja Park , Jaipur',5.00,2.50,'Prafful@UPI','','2026-07-30 12:59:05','2026-07-31 13:23:25','Exquisite Dining');
/*!40000 ALTER TABLE `restaurant_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_timings`
--

DROP TABLE IF EXISTS `restaurant_timings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_timings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `open_time` time DEFAULT '09:00:00',
  `close_time` time DEFAULT '23:00:00',
  `is_closed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `day_of_week` (`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_timings`
--

LOCK TABLES `restaurant_timings` WRITE;
/*!40000 ALTER TABLE `restaurant_timings` DISABLE KEYS */;
INSERT INTO `restaurant_timings` VALUES (1,'Monday','10:00:00','23:00:00',0),(2,'Tuesday','10:00:00','23:00:00',0),(3,'Wednesday','10:00:00','23:00:00',0),(4,'Thursday','10:00:00','23:00:00',0),(5,'Friday','10:00:00','23:59:59',0),(6,'Saturday','09:00:00','23:59:59',0),(7,'Sunday','09:00:00','22:30:00',0);
/*!40000 ALTER TABLE `restaurant_timings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Fine Dining & Gourmet Service',
  `logo_url` longtext COLLATE utf8mb4_unicode_ci,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `tax_percentage` decimal(5,2) DEFAULT '5.00',
  `service_charge_percentage` decimal(5,2) DEFAULT '2.50',
  `upi_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_payment_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES ('rest-101','Prafful Sharma Restaurant','Authentic Fine Dining & Gourmet Experience','https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg','7878606937','contact@luxedine.com','100 Gourmet Boulevard, Downtown, Suite 400',5.00,2.50,'luxedine@bank',NULL,0,1,'2026-07-30 12:58:49','2026-07-30 13:35:37'),('rest-102','Spice Symphony Bistro','Exquisite Pan-Asian & Fusion Delights','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500','9876543210','info@spicesymphony.com','45 Culinary Street, City Center',5.00,2.00,'spicesymphony@upi',NULL,0,1,'2026-07-30 12:58:49','2026-07-30 13:35:40'),('rest-103','La Bella Italia Pizzeria','Authentic Wood-Fired Neapolitan Pizza','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500','8899001122','ciao@labellaitalia.com','12 Via Roma Way, Little Italy',5.00,2.50,'labella@okaxis',NULL,0,1,'2026-07-30 12:58:49','2026-07-30 13:56:13'),('rest-1785416345515','Meals on wheels ','Exquisite Dining','https://res.cloudinary.com/dekctt0su/image/upload/v1785416979/restaurant_logos/mywhqmggkjqlirfpuxmo.png','+917878606937','praffulsharma38@gmail.com','Raja Park , Jaipur',5.00,2.50,'Prafful@UPI',NULL,1,0,'2026-07-30 12:59:05','2026-07-31 13:23:25');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_transactions`
--

DROP TABLE IF EXISTS `reward_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_transactions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int NOT NULL,
  `type` enum('EARNED','REDEEMED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `reward_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reward_transactions_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_transactions`
--

LOCK TABLES `reward_transactions` WRITE;
/*!40000 ALTER TABLE `reward_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `reward_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_vehicles`
--

DROP TABLE IF EXISTS `saved_vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_vehicles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `car_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `car_model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `saved_vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_vehicles`
--

LOCK TABLES `saved_vehicles` WRITE;
/*!40000 ALTER TABLE `saved_vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Valued Customer',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('CUSTOMER','ADMIN','KITCHEN','WAITER') COLLATE utf8mb4_unicode_ci DEFAULT 'CUSTOMER',
  `reward_points` int DEFAULT '0',
  `gold_member` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_blocked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin_1785418118910','+917878606937','Prafful Sharma (Super Admin)','praffulsharma38@gmail.com',NULL,'ADMIN',1000,1,'2026-07-30 13:28:38','2026-08-06 10:57:35',0),('u_admin','+18000001','Restaurant Owner','admin@luxedine.com','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','ADMIN',1000,1,'2026-07-30 12:58:49','2026-07-30 12:58:49',0),('u_admin2','+919876543210','Test User','prafful@restaurant.com','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150','ADMIN',1000,1,'2026-07-30 12:58:49','2026-08-01 11:20:11',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_calls`
--

DROP TABLE IF EXISTS `waiter_calls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_calls` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','ATTENDED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_calls`
--

LOCK TABLES `waiter_calls` WRITE;
/*!40000 ALTER TABLE `waiter_calls` DISABLE KEYS */;
INSERT INTO `waiter_calls` VALUES ('wc_1','Table 12','u102','ATTENDED','2026-07-30 12:58:49','2026-08-04 13:44:06'),('wc_1785850189716','Table 5',NULL,'ATTENDED','2026-08-04 13:29:49','2026-08-04 13:43:51'),('wc_1785850254832','Table 12 / Tesla NY 04 (Extra napkins)',NULL,'ATTENDED','2026-08-04 13:30:54','2026-08-04 13:44:07'),('wc_1785850322736','Table 12 / Tesla NY 04 (fdm,vodmv)',NULL,'ATTENDED','2026-08-04 13:32:02','2026-08-04 13:44:07'),('wc_1785851065854','Table 12 / Tesla NY 04 (pani le kr aa)',NULL,'ATTENDED','2026-08-04 13:44:25','2026-08-04 13:44:35'),('wc_1785851206159','Table 12 / Tesla NY 04 (chai chini ke sath)',NULL,'ATTENDED','2026-08-04 13:46:46','2026-08-04 17:14:17');
/*!40000 ALTER TABLE `waiter_calls` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:54:05
