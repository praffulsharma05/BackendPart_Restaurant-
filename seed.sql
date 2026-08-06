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

-- 5. Insert Menu Categories (From Menu Card)
INSERT INTO menu_categories (id, name, description, display_order, is_active) VALUES
(1, 'Non Veg Snacks', 'Sizzling tandoori kebabs, tikkas, and crispy chicken snacks', 1, TRUE),
(2, 'Non Veg Platter', 'Assorted kebab and tikka cocktail platters', 2, TRUE),
(3, 'Non Veg Roll', 'Delicious charcoal grilled rolls wrapped in soft rumali or paratha', 3, TRUE),
(4, 'Main Course', 'Rich Punjabi gravies, chicken curries, egg curries & mutton specialties', 4, TRUE),
(5, 'Biryani', 'Aromatic dum biryani cooked with basmati rice and fresh spices', 5, TRUE),
(6, 'Momos', 'Roasted, Afghani, and chili chicken momos', 6, TRUE),
(7, 'Party Pack', 'Large family party buckets & sharing combos', 7, TRUE);

-- 6. Insert Menu Items (From Menu Card Image)
INSERT INTO menu_items (id, category_id, name, category, price, description, image_url, is_vegetarian, inventory_status, rating) VALUES
('m_nv_snack_1', 1, 'Peshawari Chicken Tikka (6pcs)', 'Non Veg Snacks', 225.00, 'Juicy chicken chunks marinated in aromatic Peshawari spices, yogurt, and char-grilled in tandoor.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_2', 1, 'Afgani Chicken Tikka (6pcs)', 'Non Veg Snacks', 225.00, 'Tender boneless chicken marinated in cashew cream, white pepper, and mild Afghan herbs.', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_3', 1, 'Malai Chicken Tikka (6pcs)', 'Non Veg Snacks', 250.00, 'Melt-in-mouth chicken morsels infused with rich malai cream, grated cheese, and cardamom.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_4', 1, 'Kaali Mirch Chicken Tikka (6pcs)', 'Non Veg Snacks', 250.00, 'Spicy clay-oven roasted chicken tikka seasoned with fresh coarsely ground black peppercorns.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_5', 1, 'Roasted Jumbo Chicken Legs', 'Non Veg Snacks', 160.00, 'Succulent jumbo chicken drumsticks roasted with chef special spice rub and melted butter.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_6', 1, 'Tandoori Chicken (Full)', 'Non Veg Snacks', 420.00, 'Classic full chicken marinated overnight in spicy tandoori yogurt marinade and charcoal roasted.', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_7', 1, 'Butter Tandoori Chicken', 'Non Veg Snacks', 520.00, 'Full tandoori chicken generously basted with clarified butter, chat masala, and coriander.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_8', 1, 'Kaali Mirch Jumbo Legs', 'Non Veg Snacks', 180.00, 'Jumbo chicken leg pieces infused with pungent crushed black pepper and garlic glaze.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_9', 1, 'Fried Chicken Pakora (8pcs)', 'Non Veg Snacks', 180.00, 'Crispy spiced chicken fritters coated in gram flour batter and fried until golden.', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_10', 1, 'Lemon Chicken (6pcs)', 'Non Veg Snacks', 225.00, 'Zesty chicken appetizers tossed in fresh lemon juice, green chilies, and aromatic ginger.', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_11', 1, 'Mutton Tikka (8pcs)', 'Non Veg Snacks', 320.00, 'Tender boneless mutton cubes marinated in papaya paste & royal spices, skewered to perfection.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_12', 1, 'Mutton Seekh Kebab', 'Non Veg Snacks', 320.00, 'Spiced minced mutton blended with herbs, coriander, and char-grilled over glowing coals.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_13', 1, 'Roasted Fish (6pcs)', 'Non Veg Snacks', 320.00, 'Fresh river fish fillets coated with ajwain tandoori marinade and oven roasted.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_14', 1, 'Fry Fish (8pcs)', 'Non Veg Snacks', 320.00, 'Amritsari style crispy battered fish fingers served hot with mint dip and onion rings.', 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_15', 1, 'Chilly Chicken', 'Non Veg Snacks', 185.00, 'Indo-Chinese style crispy chicken tossed with crunchy bell peppers, onions, & spicy chili sauce.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_16', 1, 'Chicken Lollipop', 'Non Veg Snacks', 185.00, 'Crispy fried frenched chicken wings coated in garlic chili sauce with scallions.', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_17', 1, 'Sauted Chicken', 'Non Veg Snacks', 250.00, 'Juicy chicken breast strips sautéed with butter, crushed peppercorns, and fresh herbs.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_snack_18', 1, 'Sauted Mutton', 'Non Veg Snacks', 320.00, 'Slow-sauteed boneless mutton bites cooked in desi ghee with cracked spices & caramelized onions.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_nv_platter_1', 2, 'Chicken Tikka Cocktail', 'Non Veg Platter', 225.00, 'Assorted sampler platter featuring Peshawari, Afgani, and Malai chicken tikka pieces.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_platter_2', 2, 'Chicken & Mutton Kebab Cocktail', 'Non Veg Platter', 225.00, 'Combination starter platter with char-grilled chicken tikka and juicy mutton seekh kebabs.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_platter_3', 2, 'Chicken & Leg Cocktail', 'Non Veg Platter', 290.00, 'Grand meat platter featuring roasted jumbo chicken leg and spicy tandoori chicken bites.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_platter_4', 2, 'Chicken & Fish Cocktail', 'Non Veg Platter', 290.00, 'Surf & turf platter combining crispy fried fish fingers and tandoori chicken delicacies.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_nv_roll_1', 3, 'Chicken Tikka Roll', 'Non Veg Roll', 160.00, 'Charcoal grilled chicken tikka wrapped in warm buttered rumali roti with onions & sauces.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_roll_2', 3, 'Mutton Roll', 'Non Veg Roll', 250.00, 'Tender spiced mutton pieces wrapped in soft paratha with spicy green chutney.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_roll_3', 3, 'Mutton Kebab Roll', 'Non Veg Roll', 160.00, 'Smoky mutton seekh kebab wrapped in freshly baked lachha paratha.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_roll_4', 3, 'Fish Roll', 'Non Veg Roll', 160.00, 'Crispy fish fillet wrapped in wrap with lemon garlic spread and crunchy salad.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_roll_5', 3, 'Afgani Chicken Roll', 'Non Veg Roll', 170.00, 'Rich cream Afghani chicken tikka wrapped in a warm malai paratha.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_nv_roll_6', 3, 'Afgani Kebab Roll', 'Non Veg Roll', 170.00, 'Mutton seekh kebab infused with Afghan herbs wrapped with garlic emulsion.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_main_1', 4, 'Egg Curry (3pcs)', 'Main Course', 160.00, 'Hard-boiled eggs simmered in a rich Punjabi style spicy onion tomato gravy.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_2', 4, 'Amritsari Chicken Curry (3pcs)', 'Main Course', 225.00, 'Authentic dhaba style chicken curry cooked with ground coriander, cumin, & red chili.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_3', 4, 'Punjabi Mutton Curry (3pcs)', 'Main Course', 320.00, 'Slow-cooked tender mutton pieces simmered in rich aromatic Punjabi onion gravy.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_4', 4, 'Mutton Keema Kalegi', 'Main Course', 320.00, 'Fine minced mutton and fresh liver cooked with green chilies, tomatoes, & garam masala.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_5', 4, 'Chicken Bhartha', 'Main Course', 225.00, 'Shredded tandoori chicken cooked in creamy tomato butter gravy with scrambled eggs.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_6', 4, 'Butter Chicken Curry (3pcs)', 'Main Course', 250.00, 'World-renowned chicken cooked in velvety tomato, butter, and cashew cream sauce.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_7', 4, 'Chicken Tikka Masala', 'Main Course', 300.00, 'Charcoal grilled chicken tikka chunks cooked in spicy bell pepper and tomato gravy.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_8', 4, 'Butter Chicken Tikka Masala', 'Main Course', 320.00, 'Delightful fusion of smoked chicken tikka tossed in rich butter masala sauce.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_9', 4, 'Mutton Kebab Masala', 'Main Course', 375.00, 'Mutton seekh kebabs cut into rounds and simmered in thick spicy gravy.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_10', 4, 'Kadhai Chicken', 'Main Course', 250.00, 'Chicken pieces stir-fried with bell peppers, onions, and freshly pounded kadhai masala.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_11', 4, 'Kali Mirchi Chicken Curry (Boneless 6 Pcs.)', 'Main Course', 320.00, 'Boneless chicken cooked in a peppery cream and yogurt based white gravy.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_main_12', 4, 'Tawa Chicken', 'Main Course', 250.00, 'Street-style spicy chicken stir-fried on iron tawa with thick onion tomato masala.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_biryani_1', 5, 'Chicken Biryani', 'Biryani', 160.00, 'Hyderabadi style layered basmati rice dum cooked with spiced chicken, saffron, & mint.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_biryani_2', 5, 'Mutton Biryani', 'Biryani', 200.00, 'Royal aromatic basmati rice dum cooked with tender mutton chunks and caramelized onions.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_momos_1', 6, 'Roasted Chicken Momos', 'Momos', 125.00, 'Steamed chicken dumplings char-roasted in tandoor with red chili marinade.', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_momos_2', 6, 'Afgani Momos', 'Momos', 175.00, 'Chicken momos coated in rich Afghan creamy white sauce with herbs.', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_momos_3', 6, 'Chillychicken Momos', 'Momos', 200.00, 'Crispy fried momos tossed with chili chicken sauce, bell peppers, & garlic.', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80', FALSE, 'AVAILABLE', 4.80),

('m_party_1', 7, 'Amritsari Chicken Curry (Party Pack)', 'Party Pack', 375.00, 'Large family sharing portion of authentic dhaba Amritsari chicken curry.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_party_2', 7, 'Punjabi Mutton Curry (Party Pack)', 'Party Pack', 625.00, 'Generous party pack of slow cooked Punjabi spiced mutton curry.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_party_3', 7, 'Keema Kalegi (Party Pack)', 'Party Pack', 625.00, 'Extra-large party portion of minced mutton keema & liver bhuna masala.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', FALSE, 'AVAILABLE', 4.80),
('m_party_4', 7, 'Butter Chicken Curry (Party Pack)', 'Party Pack', 500.00, 'Jumbo party bucket of rich buttery tomato cashew cream chicken curry.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', FALSE, 'AVAILABLE', 4.80);

-- 7. Ingredients (Empty default dataset)

-- 8. Customization Options (Empty default dataset)

-- 9. Offers & Coupons
INSERT INTO offers (id, code, title, description, offer_type, discount_percent, discount_amount, min_order_amount, max_discount_amount, valid_until, is_active) VALUES
('off_db_1', 'FESTIVE50', 'Festival Delight', 'Get 50% OFF up to ₹150 on your order!', 'PERCENTAGE', 50.00, 0.00, 250.00, 150.00, '2026-12-31 23:59:59', TRUE),
('off_db_2', 'LUXE40', 'Meals on Wheels Special', 'Enjoy 40% OFF today on all menu items.', 'PERCENTAGE', 40.00, 0.00, 200.00, 100.00, '2026-12-31 23:59:59', TRUE);

-- 10. Insert Sample Orders
INSERT INTO orders (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status, created_at) VALUES
('ord_1001', 'u101', 'Car Order', 52.50, 10.50, 2.10, 1.05, 45, 0, 45.15, 'Preparing', 20, 'QR Scan', 'PAID', CURRENT_TIMESTAMP);

INSERT INTO order_fulfillment_car (order_id, car_number, car_model, parking_spot) VALUES
('ord_1001', 'DXB 48291', 'Porsche Taycan (Black)', 'Spot B-04');

INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, custom_instructions) VALUES
('oi_1', 'ord_1001', 'm_nv_snack_1', 'Peshawari Chicken Tikka (6pcs)', 225.00, 1, 225.00, 'Extra hot'),
('oi_2', 'ord_1001', 'm_nv_snack_3', 'Malai Chicken Tikka (6pcs)', 250.00, 1, 250.00, 'Medium spicy');

-- 11. Insert Reward Transactions (6 Month Expiry)
INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date, created_at) VALUES
('rt1', 'u101', 'ord_1001', 45, 'EARNED', DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH), CURRENT_TIMESTAMP);

-- 12. Insert Waiter Calls & Notifications
INSERT INTO waiter_calls (id, table_number, user_id, status, created_at) VALUES
('wc_1', 'Table 12', 'u102', 'PENDING', CURRENT_TIMESTAMP);

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
('n1', 'u101', 'Order Accepted', 'Your Car Order #ord_1001 has been accepted. Estimated prep time: 20 mins.', 'ORDER', FALSE, CURRENT_TIMESTAMP);
