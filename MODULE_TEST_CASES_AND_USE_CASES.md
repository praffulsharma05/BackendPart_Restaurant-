# 🧪 Comprehensive Test Cases & Use Cases — Express Backend API

This document provides a detailed breakdown of **Use Cases** and **Test Cases** for **every API controller and service module** in the `Backend` application (`d:\Restaurant\Backend`).

---

## 📑 Table of Modules
1. [Authentication API Module (`auth.controller.ts`)](#1-authentication-api-module-authcontrollerts)
2. [Menu Management API Module (`menu.controller.ts`)](#2-menu-management-api-module-menucontrollerts)
3. [Orders & Fulfillment API Module (`order.controller.ts`)](#3-orders--fulfillment-api-module-ordercontrollerts)
4. [Customization & Add-on API Module (`customization.controller.ts`)](#4-customization--add-on-api-module-customizationcontrollerts)
5. [Reviews & Ratings API Module (`review.controller.ts`)](#5-reviews--ratings-api-module-reviewcontrollerts)
6. [Reward Points API Module (`reward.controller.ts`)](#6-reward-points-api-module-rewardcontrollerts)
7. [Cart API Module (`cart.controller.ts`)](#7-cart-api-module-cartcontrollerts)
8. [Offers & Promotions API Module (`offer.controller.ts`)](#8-offers--promotions-api-module-offercontrollerts)
9. [Payment API Module (`payment.controller.ts`)](#9-payment-api-module-paymentcontrollerts)
10. [Waiter & Call Attendant API Module (`waiter.controller.ts`)](#10-waiter--call-attendant-api-module-waitercontrollerts)
11. [Analytics API Module (`analytics.controller.ts`)](#11-analytics-api-module-analyticscontrollerts)
12. [SuperAdmin API Module (`superadmin.controller.ts`)](#12-superadmin-api-module-superadmincontrollerts)

---

## 1. Authentication API Module (`auth.controller.ts`)

### 📌 Use Cases
- **UC-BE-AUTH-01 (Send Phone OTP)**: Generate 6-digit OTP code and send via SMS gateway.
- **UC-BE-AUTH-02 (Verify OTP & Issue JWT)**: Validate OTP, create user record if new, and return signed JWT bearer token.
- **UC-BE-AUTH-03 (Admin Auth Login)**: Verify admin email & bcrypt hashed password, returning admin JWT token.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-AUTH-01** | `POST /api/auth/send-otp` | `{ "phone": "9876543210" }` | `200 OK` | `{ "success": true, "message": "OTP sent successfully" }` |
| **TC-BE-AUTH-02** | `POST /api/auth/verify-otp` | `{ "phone": "9876543210", "otp": "123456" }` | `200 OK` | `{ "success": true, "token": "eyJhbGci...", "user": { ... } }` |
| **TC-BE-AUTH-03** | `POST /api/auth/verify-otp` | `{ "phone": "9876543210", "otp": "000000" }` | `400 Bad Request` | `{ "success": false, "error": "Invalid or expired OTP" }` |
| **TC-BE-AUTH-04** | `POST /api/auth/admin/login` | `{ "email": "admin@test.com", "password": "wrong" }` | `401 Unauthorized` | `{ "success": false, "error": "Invalid email or password" }` |

---

## 2. Menu Management API Module (`menu.controller.ts`)

### 📌 Use Cases
- **UC-BE-MENU-01 (Fetch Active Menu)**: Retrieve full list of active categories and available delicacies.
- **UC-BE-MENU-02 (Admin Create / Edit Dish)**: Insert new dish record or update availability status.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-MENU-01** | `GET /api/menu` | None | `200 OK` | `{ "success": true, "data": [ { "id": 1, "name": "Paneer Butter Masala", ... } ] }` |
| **TC-BE-MENU-02** | `POST /api/menu` (No Admin JWT) | `{ "name": "New Dish" }` | `401 Unauthorized` | `{ "success": false, "error": "Access token required" }` |
| **TC-BE-MENU-03** | `PUT /api/menu/:id/toggle` | Path param `id=5` | `200 OK` | `{ "success": true, "is_available": false }` |

---

## 3. Orders & Fulfillment API Module (`order.controller.ts`)

### 📌 Use Cases
- **UC-BE-ORD-01 (Create Multi-Fulfillment Order)**: Store order with items, fulfillment type (`pickup`, `car_service`, `dine_in`, `pre_order`), and calculate subtotal/taxes.
- **UC-BE-ORD-02 (Update Order Status & Preparation Countdown)**: Admin updates status to `preparing` with prep time minutes or `ready` / `delivered`.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-ORD-01** | `POST /api/orders` | `{ "fulfillment_type": "car_service", "car_details": { "model": "Civic", "color": "Black", "plate": "ABC-1234" }, "items": [...] }` | `201 Created` | `{ "success": true, "order_id": 102, "status": "pending" }` |
| **TC-BE-ORD-02** | `PUT /api/orders/102/status` | `{ "status": "preparing", "prep_time": "20 min" }` | `200 OK` | `{ "success": true, "order": { "id": 102, "status": "preparing", "prep_time": "20 min" } }` |
| **TC-BE-ORD-03** | `GET /api/orders/102` | None | `200 OK` | `{ "success": true, "order": { ... } }` |

---

## 4. Customization & Add-on API Module (`customization.controller.ts`)

### 📌 Use Cases
- **UC-BE-CUST-01 (Fetch Dish Add-on Groups)**: Return available add-on options (e.g. extra cheese, spice level) for a specific dish.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-CUST-01** | `GET /api/customizations/dish/5` | None | `200 OK` | `{ "success": true, "groups": [ { "name": "Size", "options": [...] } ] }` |

---

## 5. Reviews & Ratings API Module (`review.controller.ts`)

### 📌 Use Cases
- **UC-BE-REV-01 (Submit Customer Meal Review)**: Record review rating, tags, and comment in `pending` state.
- **UC-BE-REV-02 (Approve Review & Credit Loyalty Points)**: Admin approves review; backend credits +10 reward points to user account.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-REV-01** | `POST /api/reviews` | `{ "rating": 5, "comment": "Delicious!", "order_id": 102 }` | `201 Created` | `{ "success": true, "message": "Review submitted for approval" }` |
| **TC-BE-REV-02** | `PUT /api/reviews/45/approve` | None (Admin Auth Header) | `200 OK` | `{ "success": true, "points_awarded": 10 }` |

---

## 6. Reward Points API Module (`reward.controller.ts`)

### 📌 Use Cases
- **UC-BE-REW-01 (Get User Points Balance)**: Return total accumulated loyalty points and history log.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-REW-01** | `GET /api/rewards/balance` | User JWT Header | `200 OK` | `{ "success": true, "points_balance": 150 }` |

---

## 7. Cart API Module (`cart.controller.ts`)

### 📌 Use Cases
- **UC-BE-CART-01 (Sync Cart)**: Save or update server-side cart state for authenticated user.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-CART-01** | `POST /api/cart/sync` | `{ "items": [ { "dish_id": 1, "quantity": 2 } ] }` | `200 OK` | `{ "success": true, "cart": [...] }` |

---

## 8. Offers & Promotions API Module (`offer.controller.ts`)

### 📌 Use Cases
- **UC-BE-OFFER-01 (Validate Coupon Code)**: Check coupon eligibility, expiration, minimum purchase requirements, and calculate discount.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-OFFER-01** | `POST /api/offers/validate` | `{ "code": "ROYAL50", "cart_total": 100 }` | `200 OK` | `{ "success": true, "discount_amount": 50 }` |
| **TC-BE-OFFER-02** | `POST /api/offers/validate` | `{ "code": "EXPIRED", "cart_total": 100 }` | `400 Bad Request` | `{ "success": false, "error": "Coupon code expired" }` |

---

## 9. Payment API Module (`payment.controller.ts`)

### 📌 Use Cases
- **UC-BE-PAY-01 (Initiate Payment Transaction)**: Create payment order ID for online gateway processing.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-PAY-01** | `POST /api/payment/create-intent` | `{ "order_id": 102, "amount": 45.50 }` | `200 OK` | `{ "success": true, "client_secret": "pi_123_secret" }` |

---

## 10. Waiter & Call Attendant API Module (`waiter.controller.ts`)

### 📌 Use Cases
- **UC-BE-WAIT-01 (Create Waiter Call Alert)**: Save dining table assistance request.
- **UC-BE-WAIT-02 (Resolve Waiter Alert)**: Mark request as attended.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-WAIT-01** | `POST /api/waiter/call` | `{ "table_number": 4, "reason": "Need Water" }` | `201 Created` | `{ "success": true, "alert_id": 89 }` |
| **TC-BE-WAIT-02** | `PUT /api/waiter/alerts/89/resolve` | None | `200 OK` | `{ "success": true, "status": "resolved" }` |

---

## 11. Analytics API Module (`analytics.controller.ts`)

### 📌 Use Cases
- **UC-BE-ANA-01 (Get Sales Metrics)**: Return total revenue, order count breakdown, and top dishes for a given timeframe.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-ANA-01** | `GET /api/analytics/dashboard?range=30d` | Admin JWT Header | `200 OK` | `{ "success": true, "revenue": 14500.00, "total_orders": 340 }` |

---

## 12. SuperAdmin API Module (`superadmin.controller.ts`)

### 📌 Use Cases
- **UC-BE-SUPER-01 (System Audit Logs & Global Settings)**: Query system wide error/access logs and global restaurant system flags.

### 🧪 Test Cases Matrix
| Test Case ID | API Endpoint | Input Payload | Expected HTTP Status | Expected Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SUPER-01** | `GET /api/superadmin/system-status` | SuperAdmin JWT Header | `200 OK` | `{ "success": true, "db_connected": true, "active_sessions": 12 }` |
