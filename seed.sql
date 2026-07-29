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
TRUNCATE TABLE restaurant_info;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Restaurant Info
INSERT INTO restaurant_info (id, name, logo_url, phone, address, tax_percentage, service_charge_percentage, upi_id, qr_payment_image_url) VALUES
(1, 'Luxe Dine Restaurant', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300', '+1 800-589-3463', '100 Gourmet Boulevard, Downtown, Suite 400', 5.00, 2.50, 'luxedine@bank', 'https://images.unsplash.com/photo-1556742049-0a67dd35f3d7?w=500');

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

-- 6. Insert Menu Items (Including Paneer Tikka marked as SOLD_OUT)
INSERT INTO menu_items (id, category_id, name, description, price, rating, category, image_url, is_vegetarian, is_hidden, inventory_status) VALUES
('m1', 2, 'Truffle Tagliolini', 'Fresh hand-cut tagliolini tossed in black winter truffle butter and Parmigiano Reggiano.', 28.50, 4.90, 'Main Course', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', TRUE, FALSE, 'AVAILABLE'),
('m2', 1, 'Acaí Super Bowl', 'Vibrant organic acaí garnished with blueberries, wild strawberries, and almond butter.', 18.50, 4.80, 'Starters', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500', TRUE, FALSE, 'AVAILABLE'),
('m3', 2, 'Signature Wagyu Burger', 'A5 Wagyu patty, caramelized onions, smoked cheddar on a toasted brioche bun.', 24.00, 4.90, 'Main Course', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', FALSE, FALSE, 'AVAILABLE'),
('m4', 1, 'Paneer Tikka Royale', 'Marinated cottage cheese cubes grilled in tandoor with mint chutney.', 19.00, 4.75, 'Starters', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500', TRUE, FALSE, 'SOLD_OUT'),
('m5', 3, 'Valrhona Chocolate Fondant', 'Warm molten dark chocolate fondant with Madagascar vanilla bean ice cream.', 14.00, 4.90, 'Desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', TRUE, FALSE, 'AVAILABLE'),
('m6', 4, 'Artisan Smoked Old Fashioned', 'Bourbon infused with hickory smoke, Angostura bitters, and burnt orange peel.', 16.00, 4.80, 'Beverages', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500', TRUE, FALSE, 'AVAILABLE');

-- 7. Insert Ingredients
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_name) VALUES
('m1', 'Tagliolini Pasta'), ('m1', 'Black Truffle'), ('m1', 'AOP Butter'),
('m2', 'Organic Acaí'), ('m2', 'Blueberries'), ('m2', 'Almond Butter'),
('m3', 'A5 Wagyu Beef'), ('m3', 'Brioche Bun'), ('m3', 'Smoked Cheddar'),
('m4', 'Paneer (Cottage Cheese)'), ('m4', 'Bell Peppers'), ('m4', 'Mint Chutney'),
('m5', 'Valrhona Chocolate'), ('m5', 'Vanilla Bean'), ('m5', 'Organic Eggs'),
('m6', 'Bourbon'), ('m6', 'Bitters'), ('m6', 'Hickory Smoke');

-- 8. Insert Customization Options
INSERT INTO customization_options (id, menu_item_id, name, price) VALUES
('o1', 'm1', 'Extra Truffle Shavings', 6.00),
('o2', 'm1', 'Gluten Free Pasta', 2.00),
('o3', 'm3', 'Extra Wagyu Patty', 10.00),
('o4', 'm3', 'Truffle Fries Upgrade', 4.50);

-- 9. Insert Offers & Coupons
INSERT INTO offers (id, code, title, description, offer_type, discount_percent, min_order_amount, max_discount_amount, valid_until, is_active) VALUES
('off1', 'LUXE20', '20% OFF Gourmet Dining', 'Get 20% discount on all orders above $50', 'PERCENTAGE', 20.00, 50.00, 25.00, '2026-12-31 23:59:59', TRUE),
('off2', 'FIRSTORDER', 'First Order Special', 'Get $10 flat discount on your very first order', 'FIRST_ORDER', 0.00, 25.00, 10.00, '2026-12-31 23:59:59', TRUE),
('off3', 'CASHBACK15', '15% Rewards Cashback', 'Earn 15% bonus reward points on dine-in', 'CASHBACK', 15.00, 30.00, 15.00, '2026-12-31 23:59:59', TRUE);

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
