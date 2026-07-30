-- =======================================================
-- Restaurant Enterprise Seed Data Script
-- Database: Restaurant
-- =======================================================

USE Restaurant;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notifications;
TRUNCATE TABLE waiter_calls;
TRUNCATE TABLE reward_transactions;
TRUNCATE TABLE order_item_options;
TRUNCATE TABLE order_items;
TRUNCATE TABLE order_fulfillment_pre_order;
TRUNCATE TABLE order_fulfillment_dine_in;
TRUNCATE TABLE order_fulfillment_car;
TRUNCATE TABLE orders;
TRUNCATE TABLE offers;
TRUNCATE TABLE customization_options;
TRUNCATE TABLE menu_item_ingredients;
TRUNCATE TABLE menu_items;
TRUNCATE TABLE menu_categories;
TRUNCATE TABLE saved_vehicles;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;
TRUNCATE TABLE restaurant_timings;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE restaurant_info;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Restaurant Info & Initial Tenants
INSERT INTO restaurant_info (id, name, tagline, logo_url, phone, address, tax_percentage, service_charge_percentage, upi_id, qr_payment_image_url) VALUES
(1, 'Prafful Sharma Restaurant', 'Authentic Fine Dining & Gourmet Experience', 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg', '7878606937', '100 Gourmet Boulevard, Downtown, Suite 400', 5.00, 2.50, 'luxedine@bank', 'https://images.unsplash.com/photo-1556742049-0a67dd35f3d7?w=500');

INSERT INTO restaurants (id, name, tagline, logo_url, phone, email, address, tax_percentage, service_charge_percentage, upi_id, is_active) VALUES
('rest-101', 'Prafful Sharma Restaurant', 'Authentic Fine Dining & Gourmet Experience', 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg', '7878606937', 'contact@luxedine.com', '100 Gourmet Boulevard, Downtown, Suite 400', 5.00, 2.50, 'luxedine@bank', TRUE),
('rest-102', 'Spice Symphony Bistro', 'Exquisite Pan-Asian & Fusion Delights', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', '9876543210', 'info@spicesymphony.com', '45 Culinary Street, City Center', 5.00, 2.00, 'spicesymphony@upi', FALSE),
('rest-103', 'La Bella Italia Pizzeria', 'Authentic Wood-Fired Neapolitan Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', '8899001122', 'ciao@labellaitalia.com', '12 Via Roma Way, Little Italy', 5.00, 2.50, 'labella@okaxis', FALSE);

-- 2. Insert Operating Timings
INSERT INTO restaurant_timings (day_of_week, open_time, close_time, is_closed) VALUES
('Monday', '10:00:00', '23:00:00', FALSE),
('Tuesday', '10:00:00', '23:00:00', FALSE),
('Wednesday', '10:00:00', '23:00:00', FALSE),
('Thursday', '10:00:00', '23:00:00', FALSE),
('Friday', '10:00:00', '23:59:59', FALSE),
('Saturday', '09:00:00', '23:59:59', FALSE),
('Sunday', '09:00:00', '22:30:00', FALSE);

-- 3. Insert Users
INSERT INTO users (id, phone, name, email, avatar_url, role, reward_points, gold_member) VALUES
('u101', '+15550192', 'Alexander Wright', 'alex@luxedine.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'CUSTOMER', 350, TRUE),
('u102', '+15550481', 'Sophia Chen', 'sophia@luxedine.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'CUSTOMER', 120, FALSE),
('u_admin', '+18000001', 'Restaurant Owner', 'admin@luxedine.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ADMIN', 1000, TRUE),
('u_admin2', '+919876543210', 'Prafful Sharma (Manager)', 'prafful@restaurant.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'ADMIN', 1000, TRUE);

-- 4. Saved Vehicles
INSERT INTO saved_vehicles (id, user_id, car_number, car_model, is_default) VALUES
('v1', 'u101', 'DXB 48291', 'Porsche Taycan (Black)', TRUE),
('v2', 'u101', 'DXB 10928', 'Range Rover Sport (White)', FALSE);

-- 5. Insert Menu Categories
INSERT INTO menu_categories (id, name, description, display_order, is_active) VALUES
(1, 'Starters', 'Exquisite appetizers to begin your culinary journey', 1, TRUE),
(2, 'Main Course', 'Chef signature main dishes crafted with premium ingredients', 2, TRUE),
(3, 'Desserts', 'Decadent sweet creations and artisanal ice creams', 3, TRUE),
(4, 'Beverages', 'Handcrafted cocktails, mocktails, and specialty drinks', 4, TRUE);

-- 6. Menu Items (Empty default dataset - items added dynamically via Admin UI)

-- 7. Ingredients (Empty default dataset)

-- 8. Customization Options (Empty default dataset)

-- 9. Offers & Coupons (Empty default dataset - created dynamically via Admin UI)

-- 10. Insert Sample Orders
INSERT INTO orders (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status, created_at) VALUES
('ord_1001', 'u101', 'Car Order', 52.50, 10.50, 2.10, 1.05, 45, 0, 45.15, 'Preparing', 20, 'QR Scan', 'PAID', CURRENT_TIMESTAMP);

INSERT INTO order_fulfillment_car (order_id, car_number, car_model, parking_spot) VALUES
('ord_1001', 'DXB 48291', 'Porsche Taycan (Black)', 'Spot B-04');

INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, custom_instructions) VALUES
('oi_1', 'ord_1001', 'm1', 'Truffle Tagliolini', 28.50, 1, 34.50, 'Extra hot'),
('oi_2', 'ord_1001', 'm3', 'Signature Wagyu Burger', 24.00, 1, 24.00, 'Medium rare patty');

INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price) VALUES
('oi_1', 'o1', 'Extra Truffle Shavings', 6.00);

-- 11. Insert Reward Transactions (6 Month Expiry)
INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date, created_at) VALUES
('rt1', 'u101', 'ord_1001', 45, 'EARNED', DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH), CURRENT_TIMESTAMP);

-- 12. Insert Waiter Calls & Notifications
INSERT INTO waiter_calls (id, table_number, user_id, status, created_at) VALUES
('wc_1', 'Table 12', 'u102', 'PENDING', CURRENT_TIMESTAMP);

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
('n1', 'u101', 'Order Accepted', 'Your Car Order #ord_1001 has been accepted. Estimated prep time: 20 mins.', 'ORDER', FALSE, CURRENT_TIMESTAMP);
