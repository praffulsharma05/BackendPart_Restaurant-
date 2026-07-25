# 🚀 Scalable Restaurant Ordering System - Express REST API & Real-time Server

Production-grade, scalable REST API server built with **Node.js, Express.js, TypeScript, MySQL, JWT Authentication, Firebase Admin SDK, Socket.IO, and Cloudinary**.

---

## 🏗️ Tech Stack & Key Features

- **Runtime & Language**: Node.js, Express.js, TypeScript
- **Database**: MySQL 8.0+ (`mysql2/promise` with connection pooling)
- **Authentication**: Firebase OTP Phone verification + Custom JWT Access & Refresh Tokens
- **Real-Time Engine**: Socket.IO for live order tracking, kitchen status pushes, and waiter calls
- **Image Storage**: Cloudinary integration via Multer memory streaming
- **Validation**: Zod schema validation & centralized error middleware

---

## 📂 Project Architecture

```
d:\Restaurant\Backend\
├── schema.sql              # Enterprise MySQL schema (19 tables)
├── seed.sql                # Complete sample dataset (dishes, offers, orders)
├── .env                    # Environment variables configuration
├── package.json
├── tsconfig.json
└── src/
    ├── config/             # DB, Firebase Admin & Cloudinary setup
    ├── types/              # TypeScript domain types & Express definitions
    ├── middlewares/        # JWT Auth, Upload, Error handler & Validation
    ├── utils/              # JWT helpers, Logger, API response & Pagination
    ├── services/           # Business logic (Auth, Menu, Order, Offers, Rewards, Waiter, Analytics)
    ├── controllers/        # HTTP Request handlers
    ├── routes/             # REST API Routes
    ├── websocket/          # Socket.IO event listeners & rooms
    └── server.ts           # HTTP Express Server + Socket.IO bootstrap
```

---

## 🗄️ MySQL Database Setup (MySQL Workbench)

1. Open **MySQL Workbench** and connect to your connection `Restaurant` (`127.0.0.1:3306`).
2. Run [`schema.sql`](file:///d:/Restaurant/Backend/schema.sql) to create the `Restaurant` database schema and all 19 tables.
3. Run [`seed.sql`](file:///d:/Restaurant/Backend/seed.sql) to populate initial categories, items (including *Paneer Tikka Royale* marked as `SOLD_OUT`), offers, orders, and rewards.

---

## ⚡ Running the Backend Server

```bash
cd d:\Restaurant\Backend

# Development Mode (Hot Reloading via Nodemon + ts-node)
npm run dev

# Build TypeScript to JavaScript dist/
npm run build

# Production Mode
npm start
```

Base API URL: `http://localhost:5000/api`  
Health Check: `http://localhost:5000/health`

---

## 📡 Socket.IO Real-Time Events

- **Rooms**:
  - `kitchen`: Receives instant alerts on new orders and waiter calls (`order:created`, `waiter:call`).
  - `order_{orderId}`: Receives live order status updates (`order:status_updated`, `order:prep_time_updated`).

---

## 🔌 REST API Endpoints Overview

### 1. Authentication (`/api/auth`)
- `POST /api/auth/verify-firebase-token` — OTP verification & token generation
- `GET /api/auth/profile` — Fetch current user profile & saved vehicles

### 2. Restaurant Module (`/api/restaurant`)
- `GET /api/restaurant` — Public details, operational timings & UPI QR details
- `PUT /api/restaurant` — [Admin] Update restaurant info & QR details

### 3. Menu & Inventory Module (`/api/menu`)
- `GET /api/menu/categories` — List menu categories
- `GET /api/menu` — List menu items with search & category filters
- `GET /api/menu/:id` — Get dish details & add-on options
- `POST /api/menu/upload-image` — [Admin] Upload image to Cloudinary
- `POST /api/menu` — [Admin] Create menu item
- `PUT /api/menu/:id` — [Admin] Update menu item
- `PATCH /api/menu/:id/inventory-status` — [Admin/Kitchen] Update inventory status (`AVAILABLE` vs `SOLD_OUT`)
- `PATCH /api/menu/:id/hide` — [Admin] Hide / show menu item
- `DELETE /api/menu/:id` — [Admin] Delete menu item

### 4. Orders Module (`/api/orders`)
- `POST /api/orders` — Place order (`Dine In`, `Car Order`, `Take Away`, `Pre Order`)
- `GET /api/orders/my-orders` — Get customer order history
- `GET /api/orders/all` — [Kitchen/Admin] List all orders
- `GET /api/orders/:id` — Get single order details
- `PATCH /api/orders/:id/status` — Update order status (`Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Served` ➔ `Completed` / `Cancelled`)
- `PATCH /api/orders/:id/prep-time` — Assign prep time (10, 15, 20, 30, 45 mins)

### 5. Offers & Coupons (`/api/offers`)
- `GET /api/offers` — Get active promotions & discounts
- `POST /api/offers/validate` — Validate coupon code (Percentage, Flat, First Order, Cashback)
- `POST /api/offers` — [Admin] Create new coupon

### 6. Reward Points (`/api/rewards`)
- `GET /api/rewards/summary` — User reward points, monthly limit & 6-month expiry history

### 7. Waiter Call (`/api/waiter`)
- `POST /api/waiter/call` — Request waiter assistance to a table
- `GET /api/waiter/pending` — [Staff] View pending waiter calls
- `PATCH /api/waiter/:id/attend` — [Staff] Mark call as attended

### 8. Analytics & Owner Dashboard (`/api/analytics`)
- `GET /api/analytics/summary` — Daily & monthly revenue, total customers, cancelled order metrics
- `GET /api/analytics/top-dishes` — Most ordered dishes ranking
- `GET /api/analytics/peak-hours` — Order volume grouped by hour of the day
- `GET /api/analytics/cancelled-orders` — Cancelled orders log & reasons
