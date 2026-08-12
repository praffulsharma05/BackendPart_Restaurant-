export const ORDER_STRINGS = {
  ERRORS: {
    NO_ITEMS: 'No items in cart to place order',
    SOLD_OUT: (name: string) => `Dish '${name}' is currently Sold Out.`,
    ORDER_NOT_FOUND: 'Order not found',
    NO_VALID_ITEMS: 'No valid items selected for rejection',
    PREP_TIME_LIMIT: 'Preparation time must be a valid number between 1 and 180 minutes.',
  },
  NOTIFICATIONS: {
    PLACED_TITLE: 'Order Placed Successfully',
    PLACED_BODY: (orderId: string) =>
      `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed and is pending admin approval.`,
    ACCEPTED_TITLE: 'Order Confirmed',
    ACCEPTED_BODY: (orderId: string, prepTime?: number) =>
      `Your order #${orderId.slice(0, 8).toUpperCase()} has been confirmed!${prepTime ? ` Estimated prep time: ${prepTime} mins.` : ''}`,
    PREPARING_TITLE: 'Preparing Your Order',
    PREPARING_BODY: (orderId: string) =>
      `Your order #${orderId.slice(0, 8).toUpperCase()} is now being prepared in the kitchen.`,
    REJECTED_TITLE: 'Order Rejected ❌',
    REJECTED_BODY: (orderId: string, cancellationReason?: string) =>
      `Your order #${orderId.slice(0, 8).toUpperCase()} was rejected. Reason: ${cancellationReason || 'Restaurant unavailable'}`,
    STATUS_UPDATED_TITLE: (status: string) => `Order ${status}`,
    STATUS_UPDATED_BODY: (orderId: string, status: string) =>
      `Your order #${orderId.slice(0, 8).toUpperCase()} status is now ${status}.`,
    CANCELLED_BODY: (cancellationReason?: string) =>
      `Your order was cancelled. Reason: ${cancellationReason || 'N/A'}`,
    COMPLETED_BODY: 'Your order is ready! Enjoy your meal.',
    PARTIAL_REJECT_TITLE: 'Order Partially Accepted',
    PARTIAL_REJECT_BODY: (itemNames: string, refundAmount: number) =>
      `Partially Accepted: '${itemNames}' was/were out of stock. A refund of ₹${refundAmount.toFixed(2)} will be processed manually.`,
  },
  SQL: {
    CREATE_ORDERS_TABLE: `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        order_type VARCHAR(50) NOT NULL DEFAULT 'Pickup',
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        reward_points_earned INT NOT NULL DEFAULT 0,
        reward_points_used INT NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        prep_time_minutes INT NOT NULL DEFAULT 20,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
        cancellation_reason TEXT,
        coupon_code VARCHAR(100) NULL,
        payment_screenshot_url VARCHAR(500) NULL,
        order_token VARCHAR(128) NULL,
        special_instructions TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    ALTER_ORDERS_TABLE: `
      ALTER TABLE orders MODIFY COLUMN order_type VARCHAR(50) NOT NULL DEFAULT 'Delivery';
    `,
    ADD_COUPON_CODE_COLUMN: `
      ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(100) NULL;
    `,
    ADD_UPDATED_AT_COLUMN: `
      ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `,
    ADD_PAYMENT_SCREENSHOT: `
      ALTER TABLE orders ADD COLUMN payment_screenshot_url VARCHAR(500) NULL;
    `,
    ADD_ORDER_TOKEN_COLUMN: `
      ALTER TABLE orders ADD COLUMN order_token VARCHAR(128) NULL;
    `,
    ADD_SPECIAL_INSTRUCTIONS_COLUMN: `
      ALTER TABLE orders ADD COLUMN special_instructions TEXT NULL;
    `,
    CREATE_USERS_TABLE: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100),
        role ENUM('CUSTOMER', 'ADMIN', 'KITCHEN', 'WAITER') DEFAULT 'CUSTOMER',
        reward_points INT DEFAULT 0,
        gold_member BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_ORDER_ITEMS_TABLE: `
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        menu_item_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        custom_instructions TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_ORDER_ITEM_OPTIONS_TABLE: `
      CREATE TABLE IF NOT EXISTS order_item_options (
        order_item_id VARCHAR(50) NOT NULL,
        option_id VARCHAR(50) NOT NULL,
        option_name VARCHAR(255) NOT NULL,
        option_price DECIMAL(10,2) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_CAR_FULFILLMENT_TABLE: `
      CREATE TABLE IF NOT EXISTS order_fulfillment_car (
        order_id VARCHAR(50) PRIMARY KEY,
        car_number VARCHAR(100) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        parking_spot VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_DINE_IN_FULFILLMENT_TABLE: `
      CREATE TABLE IF NOT EXISTS order_fulfillment_dine_in (
        order_id VARCHAR(50) PRIMARY KEY,
        table_number VARCHAR(100) NOT NULL,
        seat_number VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_PRE_ORDER_FULFILLMENT_TABLE: `
      CREATE TABLE IF NOT EXISTS order_fulfillment_pre_order (
        order_id VARCHAR(50) PRIMARY KEY,
        scheduled_date VARCHAR(50) NOT NULL,
        scheduled_time VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    CREATE_SAVED_VEHICLES_TABLE: `
      CREATE TABLE IF NOT EXISTS saved_vehicles (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        car_number VARCHAR(100) NOT NULL,
        car_model VARCHAR(100) NOT NULL DEFAULT 'Car',
        is_default BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
};

