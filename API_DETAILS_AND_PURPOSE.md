# 🌐 Comprehensive API Endpoint Reference & Technical Guide

This document provides a detailed breakdown of **every API endpoint** in the **Royal Spice Backend Engine** (`d:\Restaurant\Backend`). It explains the **HTTP Method**, **Endpoint Path**, **Why it was created (Business Purpose)**, and **The Exact Role & Responsibility** of each API.

---

## 📑 Table of API Modules
1. [Authentication APIs (`/api/auth`)](#1-authentication-apis-apiauth)
2. [Menu Management APIs (`/api/menu`)](#2-menu-management-apis-apimenu)
3. [Orders & Multi-Fulfillment APIs (`/api/orders`)](#3-orders--multi-fulfillment-apis-apiorders)
4. [Review & Moderation APIs (`/api/reviews`)](#4-review--moderation-apis-apireviews)
5. [Cart Management APIs (`/api/cart`)](#5-cart-management-apis-apicart)
6. [Loyalty Rewards APIs (`/api/rewards`)](#6-loyalty-rewards-apis-apirewards)
7. [Offers & Promotions APIs (`/api/offers`)](#7-offers--promotions-apis-apioffers)
8. [Waiter & Call Attendant APIs (`/api/waiter`)](#8-waiter--call-attendant-apis-apiwaiter)
9. [Payment Gateway APIs (`/api/payment`)](#9-payment-gateway-apis-apipayment)
10. [Analytics & Reports APIs (`/api/analytics`)](#10-analytics--reports-apis-apianalytics)
11. [Notifications APIs (`/api/notifications`)](#11-notifications-apis-apinotifications)
12. [SuperAdmin & System APIs (`/api/superadmin`)](#12-superadmin--system-apis-apisuperadmin)

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 `POST /api/auth/send-otp`
- **HTTP Method**: `POST`
- **Why We Created This API**: To enable passwordless, secure login for customers using their mobile numbers without requiring complex passwords.
- **Role & Responsibility**: Accepts a 10-digit mobile number, generates a random 6-digit OTP code, saves it with an expiration timestamp, and triggers SMS gateway delivery.

### 1.2 `POST /api/auth/verify-otp`
- **HTTP Method**: `POST`
- **Why We Created This API**: To authenticate the customer after they type the 6-digit OTP code.
- **Role & Responsibility**: Validates the entered OTP against stored database credentials. If valid, it retrieves or creates the user profile, generates a signed JWT access token, and returns the token to the frontend.

### 1.3 `POST /api/auth/admin/login`
- **HTTP Method**: `POST`
- **Why We Created This API**: To secure restaurant staff and manager access to the Admin Operations Portal.
- **Role & Responsibility**: Validates admin email and bcrypt-hashed password. Returns an admin-privileged JWT token containing role permissions (`admin`, `kitchen`, `manager`).

---

## 2. Menu Management APIs (`/api/menu`)

### 2.1 `GET /api/menu`
- **HTTP Method**: `GET`
- **Why We Created This API**: To serve the full food catalog to customers on the frontend app.
- **Role & Responsibility**: Queries active menu categories, dishes, prices, descriptions, image URLs, dietary indicators (Veg/Non-Veg), and stock availability flags.

### 2.2 `POST /api/menu`
- **HTTP Method**: `POST`
- **Why We Created This API**: To allow restaurant admins to introduce new dishes to the menu.
- **Role & Responsibility**: Accepts dish details (name, category_id, price, description, image_url) from the Admin panel, validates input parameters, inserts the dish into the database, and clears menu caches.

### 2.3 `PUT /api/menu/:id/toggle`
- **HTTP Method**: `PUT`
- **Why We Created This API**: To allow kitchen staff to instantly mark a dish as "Sold Out" or "In Stock" with a single tap.
- **Role & Responsibility**: Flips the `is_available` boolean column for dish `:id` in the database and notifies active frontend clients so "Sold Out" badges render immediately.

---

## 3. Orders & Multi-Fulfillment APIs (`/api/orders`)

### 3.1 `POST /api/orders`
- **HTTP Method**: `POST`
- **Why We Created This API**: To process new customer orders across all 4 fulfillment channels (Pickup, Car Service, Dine-In, Pre-Order).
- **Role & Responsibility**: Calculates order subtotal, applies tax/discounts, records specialized fulfillment details (e.g. Car Plate/Color or Table Number), sets order status to `pending`, and pushes real-time alert notifications to the kitchen dashboard.

### 3.2 `GET /api/orders`
- **HTTP Method**: `GET`
- **Why We Created This API**: To display incoming orders on the Admin Kanban board and allow customers to view order history.
- **Role & Responsibility**: Retrieves order lists filtered by status (`pending`, `preparing`, `ready`, `delivered`), fulfillment type, or user ID.

### 3.3 `PUT /api/orders/:id/status`
- **HTTP Method**: `PUT`
- **Why We Created This API**: To enable kitchen staff to update preparation progress and set preparation countdown timers.
- **Role & Responsibility**: Updates order status (`preparing`, `ready`, `delivered`, `cancelled`) and records estimated preparation duration (e.g., `20 min`). Triggers real-time status updates on customer tracking screens.

---

## 4. Review & Moderation APIs (`/api/reviews`)

### 4.1 `POST /api/reviews`
- **HTTP Method**: `POST`
- **Why We Created This API**: To collect feedback and ratings from customers after order completion.
- **Role & Responsibility**: Stores star rating (1-5), review tags, and comments in a `pending` moderation state.

### 4.2 `PUT /api/reviews/:id/approve`
- **HTTP Method**: `PUT`
- **Why We Created This API**: To prevent spam/inappropriate content from appearing publicly and reward genuine reviewers.
- **Role & Responsibility**: Admin marks review as `approved`, publishes review to the homepage, and automatically awards **+10 loyalty points** to the customer's account balance.

---

## 5. Cart Management APIs (`/api/cart`)

### 5.1 `GET /api/cart` & `POST /api/cart/sync`
- **HTTP Method**: `GET` & `POST`
- **Why We Created This API**: To preserve customer cart items across browser sessions and devices.
- **Role & Responsibility**: Saves active dish IDs, quantities, and customization selections to the user profile database, allowing seamless checkout resume.

---

## 6. Loyalty Rewards APIs (`/api/rewards`)

### 6.1 `GET /api/rewards/balance`
- **HTTP Method**: `GET`
- **Why We Created This API**: To display accumulated customer reward points and transaction logs.
- **Role & Responsibility**: Calculates total unredeemed loyalty points balance for the authenticated user.

### 6.2 `POST /api/rewards/redeem`
- **HTTP Method**: `POST`
- **Why We Created This API**: To allow customers to convert reward points into cash discounts during checkout.
- **Role & Responsibility**: Deducts points from balance and applies discount deduction line item to order total.

---

## 7. Offers & Promotions APIs (`/api/offers`)

### 7.1 `POST /api/offers/validate`
- **HTTP Method**: `POST`
- **Why We Created This API**: To verify promo code validity before checkout.
- **Role & Responsibility**: Checks promo code string (`ROYAL50`), verifies start/end dates, minimum bill thresholds, and calculates discount amount.

---

## 8. Waiter & Call Attendant APIs (`/api/waiter`)

### 8.1 `POST /api/waiter/call`
- **HTTP Method**: `POST`
- **Why We Created This API**: To enable Dine-In customers to request floor staff assistance directly from their phones.
- **Role & Responsibility**: Accepts table number and request reason ("Need Water", "Bring Bill", "Clean Table"), creating an alert card on the Admin Attendant feed.

### 8.2 `PUT /api/waiter/alerts/:id/resolve`
- **HTTP Method**: `PUT`
- **Why We Created This API**: To allow floor staff to dismiss handled table requests.
- **Role & Responsibility**: Marks attendant request as `resolved` and removes alert chime.

---

## 9. Payment Gateway APIs (`/api/payment`)

### 9.1 `POST /api/payment/create-intent`
- **HTTP Method**: `POST`
- **Why We Created This API**: To securely process online payments via UPI or Card payment gateways.
- **Role & Responsibility**: Communicates with payment provider to generate client transaction secrets and verify successful payment capture.

---

## 10. Analytics & Reports APIs (`/api/analytics`)

### 10.1 `GET /api/analytics/dashboard`
- **HTTP Method**: `GET`
- **Why We Created This API**: To provide executive business metrics and financial insights to restaurant owners.
- **Role & Responsibility**: Aggregates total revenue, order count per fulfillment channel, average order value, and top-selling delicacies over custom timeframes (7 days, 30 days).

---

## 11. Notifications APIs (`/api/notifications`)

### 11.1 `GET /api/notifications` & `PUT /api/notifications/read`
- **HTTP Method**: `GET` & `PUT`
- **Why We Created This API**: To manage in-app notification feeds for customers and admin staff.
- **Role & Responsibility**: Stores and serves real-time alerts (e.g. "Order #102 is now being prepared!") and marks read status.

---

## 12. SuperAdmin & System APIs (`/api/superadmin`)

### 12.1 `GET /api/superadmin/system-status`
- **HTTP Method**: `GET`
- **Why We Created This API**: To monitor backend server health, database connectivity, and active connections.
- **Role & Responsibility**: Returns server uptime, memory usage, DB connection pool state, and system heartbeat status.
