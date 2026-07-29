-- =======================================================
-- Restaurant Enterprise Database Schema for MySQL
-- Connection: Host: 127.0.0.1 | Port: 3306 | DB: Restaurant
-- =======================================================

CREATE DATABASE IF NOT EXISTS Restaurant
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE Restaurant;

-- 1. Restaurant Info & QR Payment Setup
CREATE TABLE IF NOT EXISTS restaurant_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL DEFAULT 'Luxe Dine',
    logo_url LONGTEXT,
    phone VARCHAR(30) DEFAULT '+1 800-589-3463',
    address TEXT,
    tax_percentage DECIMAL(5,2) DEFAULT 5.00,
    service_charge_percentage DECIMAL(5,2) DEFAULT 2.50,
    upi_id VARCHAR(100) DEFAULT 'luxedine@bank',
    qr_payment_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Restaurant Operating Timings
CREATE TABLE IF NOT EXISTS restaurant_timings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL UNIQUE,
    open_time TIME DEFAULT '09:00:00',
    close_time TIME DEFAULT '23:00:00',
    is_closed BOOLEAN DEFAULT FALSE
);

-- 3. Users Table (Customer / Admin / Kitchen / Waiter)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Valued Customer',
    email VARCHAR(150),
    avatar_url VARCHAR(500),
    role ENUM('CUSTOMER', 'ADMIN', 'KITCHEN', 'WAITER') DEFAULT 'CUSTOMER',
    reward_points INT DEFAULT 0,
    gold_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Saved Vehicles
CREATE TABLE IF NOT EXISTS saved_vehicles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    car_number VARCHAR(30) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Menu Items & Inventory Management
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(36) PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.8,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    inventory_status ENUM('AVAILABLE', 'SOLD_OUT') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- 8. Menu Item Ingredients
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 9. Customization Options (Add-ons)
CREATE TABLE IF NOT EXISTS customization_options (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 10. Offers & Coupon Codes Module
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    offer_type ENUM('PERCENTAGE', 'FLAT', 'FIRST_ORDER', 'CASHBACK') NOT NULL DEFAULT 'PERCENTAGE',
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    valid_until DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Orders Table & Status Flow
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_type ENUM('Dine In', 'Car Order', 'Take Away', 'Pre Order') NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    service_charge DECIMAL(10, 2) DEFAULT 0.00,
    reward_points_earned INT DEFAULT 0,
    reward_points_used INT DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled') DEFAULT 'Pending',
    prep_time_minutes INT DEFAULT 20, -- 10, 15, 20, 30, 45 mins
    payment_method ENUM('QR Scan', 'Card', 'Cash', 'UPI') DEFAULT 'QR Scan',
    payment_status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PENDING',
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Fulfillment Details - Car Order
CREATE TABLE IF NOT EXISTS order_fulfillment_car (
    order_id VARCHAR(36) PRIMARY KEY,
    car_number VARCHAR(30) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    parking_spot VARCHAR(20),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 13. Fulfillment Details - Dine In
CREATE TABLE IF NOT EXISTS order_fulfillment_dine_in (
    order_id VARCHAR(36) PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL,
    seat_number VARCHAR(20),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 14. Fulfillment Details - Pre Order & Take Away
CREATE TABLE IF NOT EXISTS order_fulfillment_pre_order (
    order_id VARCHAR(36) PRIMARY KEY,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 15. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    custom_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- 16. Selected Options for Order Items
CREATE TABLE IF NOT EXISTS order_item_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id VARCHAR(36) NOT NULL,
    option_id VARCHAR(36),
    option_name VARCHAR(100) NOT NULL,
    option_price DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- 17. Reward Transactions (6-Month Expiry Rule)
CREATE TABLE IF NOT EXISTS reward_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36),
    points INT NOT NULL,
    type ENUM('EARNED', 'REDEEMED') NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 18. Waiter Call Requests
CREATE TABLE IF NOT EXISTS waiter_calls (
    id VARCHAR(36) PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL,
    user_id VARCHAR(36),
    status ENUM('PENDING', 'ATTENDED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 19. System & Customer Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for Analytics & High Performance Queries
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_menu_items_status ON menu_items(inventory_status);
