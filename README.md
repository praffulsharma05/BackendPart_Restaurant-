# ⚙️ Royal Spice — Express RESTful API Engine

Welcome to the **Royal Spice Backend RESTful API Engine**, a robust, high-performance backend application built with **Node.js**, **Express.js**, and **TypeScript**.

---

## 🎯 Application Purpose & Overview
The Backend REST API serves as the central data engine powering both the Customer Frontend application and the Admin Operations Portal. It manages authentication, menu persistence, real-time multi-fulfillment order processing, automated preparation timers, review moderation, reward points calculations, and analytics reporting.

---

## 🚀 Key API Controllers & Services
1. **Authentication API (`auth.controller.ts`)**: Phone OTP generation/verification, JWT bearer token signing, customer profile management, and admin authentication.
2. **Menu Management API (`menu.controller.ts`)**: Public menu fetching, category filtering, dish creation/editing, and instant stock availability toggling.
3. **Orders & Fulfillment API (`order.controller.ts`)**: Creation of multi-fulfillment orders (Pickup, Car Service, Dine-In, Pre-Order), prep timer assignment, status transitions (`pending` ➔ `preparing` ➔ `ready` ➔ `delivered`), and polling sync.
4. **Customizations API (`customization.controller.ts`)**: Management of dish add-on groups, size options, and extra toppings.
5. **Reviews & Ratings API (`review.controller.ts`)**: Customer review submission, pending review query, admin approve/reject actions, and automated +10 loyalty point bonus transactions.
6. **Reward Points API (`reward.controller.ts`)**: Customer reward point balance queries, earned/redeemed transaction history logs, and admin manual adjustments.
7. **Cart API (`cart.controller.ts`)**: Server-side cart persistence and state sync.
8. **Offers & Promotions API (`offer.controller.ts`)**: Promo code validation (`ROYAL50`), expiration checks, minimum order amount verification, and discount calculations.
9. **Payment API (`payment.controller.ts`)**: Payment intent creation for online gateways and status verification.
10. **Waiter & Call Attendant API (`waiter.controller.ts`)**: Real-time dining table request creation ("Need Water", "Bill") and resolution status updates.
11. **Analytics API (`analytics.controller.ts`)**: Sales revenue aggregation, order volume statistics, and top-selling dish metrics over custom timeframes.
12. **SuperAdmin API (`superadmin.controller.ts`)**: Global system status checking, database connection monitoring, and error/access log streaming.

---

## 📂 Architecture & Directory Structure
```
d:\Restaurant\Backend/
├── src/
│   ├── config/                   # Environment variables & database connection configuration
│   ├── constants/                # Error strings, HTTP status constants, system defaults
│   ├── controllers/              # Express route controllers (auth, order, menu, review, etc.)
│   ├── middlewares/              # JWT auth verification, error handling, request logging
│   ├── routes/                   # API endpoint route declarations (/api/orders, /api/menu, etc.)
│   ├── services/                 # Core business logic layer & database queries
│   ├── types/                    # TypeScript interfaces & DTO type definitions
│   └── utils/                    # Password hashing (bcrypt), JWT utilities, validation helpers
├── MODULE_TEST_CASES_AND_USE_CASES.md  # Detailed API test cases & use cases for all 12 controllers
├── schema.sql                    # Database table schemas
├── seed.sql                      # Initial seed dataset
└── package.json
```

---

## 🛠️ Tech Stack & Dependencies
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Security**: JSON Web Tokens (JWT), Bcrypt, Express Rate Limit, Helmet CORS policy

---

## ⚡ Getting Started & Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with hot-reload (Port 5000)
npm run dev

# 3. Perform type checking & compile TypeScript to JS
npm run build
```

---

## 📄 Related Documentation
- 📘 [`MODULE_TEST_CASES_AND_USE_CASES.md`](file:///d:/Restaurant/Backend/MODULE_TEST_CASES_AND_USE_CASES.md) — Comprehensive API test matrix with endpoints, payloads, HTTP status codes, and expected JSON responses for all 12 controllers.
- 📙 [`CODE_REVIEW_AND_MISTAKES.md`](file:///d:/Restaurant/Backend/CODE_REVIEW_AND_MISTAKES.md) — Controller error handling logs, async promise rejection prevention, and SQL parameterization guidelines.
- 📖 [`d:\Restaurant\README.md`](file:///d:/Restaurant/README.md) — Root system architecture document.
