import { dbPool } from '../config/db';
import { CreateOrderInput, OrderStatus, PrepTimeMinutes } from '../types';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from './notification.service';

export const orderService = {
  /**
   * Ensure database tables exist and support Delivery order_type enum
   */
  async initTables() {
    try {
      await dbPool.query(`
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await dbPool.query(`
        ALTER TABLE orders MODIFY COLUMN order_type VARCHAR(50) NOT NULL DEFAULT 'Delivery';
      `);
    } catch (_e) {
      // Table modification fallback
    }

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          phone VARCHAR(20) NOT NULL UNIQUE,
          name VARCHAR(100),
          role ENUM('CUSTOMER', 'ADMIN', 'KITCHEN', 'WAITER') DEFAULT 'CUSTOMER',
          reward_points INT DEFAULT 0,
          gold_member BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_e) {
      // User table initialization fallback
    }

    try {
      await dbPool.query(`
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
      `);
    } catch (_e) {
      // order_items table initialization fallback
    }

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS order_item_options (
          order_item_id VARCHAR(50) NOT NULL,
          option_id VARCHAR(50) NOT NULL,
          option_name VARCHAR(255) NOT NULL,
          option_price DECIMAL(10,2) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_e) {
      // order_item_options table initialization fallback
    }

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS order_fulfillment_car (
          order_id VARCHAR(50) PRIMARY KEY,
          car_number VARCHAR(100) NOT NULL,
          car_model VARCHAR(100) NOT NULL,
          parking_spot VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_e) {
      // order_fulfillment_car table initialization fallback
    }

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS order_fulfillment_dine_in (
          order_id VARCHAR(50) PRIMARY KEY,
          table_number VARCHAR(100) NOT NULL,
          seat_number VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_e) {
      // order_fulfillment_dine_in table initialization fallback
    }

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS order_fulfillment_pre_order (
          order_id VARCHAR(50) PRIMARY KEY,
          scheduled_date VARCHAR(50) NOT NULL,
          scheduled_time VARCHAR(50) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_e) {
      // order_fulfillment_pre_order table initialization fallback
    }
  },

  /**
   *
   * @param userId
   * @param input
   */
  async createOrder(userId: string, input: CreateOrderInput) {
    await this.initTables();

    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();

      // Ensure user row exists to prevent MySQL Foreign Key constraint failure (orders_ibfk_1)
      let targetUserId = userId && userId.trim() ? userId.trim() : 'u101';
      try {
        const [existingUsers] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [targetUserId]);
        const uniquePhone = input.customerPhone || `+91${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const displayName = input.customerName || 'Gourmet Customer';
        
        if (existingUsers.length === 0) {
          await connection.query(
            `INSERT INTO users (id, phone, name, role, reward_points) 
             VALUES (?, ?, ?, 'CUSTOMER', 100)
             ON DUPLICATE KEY UPDATE id=id`,
            [targetUserId, uniquePhone, displayName]
          );
        } else {
          // If the user already exists, update their name and phone if provided
          const updates: string[] = [];
          const params: any[] = [];
          if (input.customerName) {
            updates.push('name = ?');
            params.push(input.customerName);
          }
          if (input.customerPhone) {
            updates.push('phone = ?');
            params.push(input.customerPhone);
          }
          if (updates.length > 0) {
            params.push(targetUserId);
            await connection.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
          }
        }
      } catch (_e) {
        targetUserId = 'u101';
        try {
          const uniquePhone = input.customerPhone || '+919876543210';
          const displayName = input.customerName || 'Gourmet Customer';
          await connection.query(
            `INSERT INTO users (id, phone, name, role, reward_points) 
             VALUES ('u101', ?, ?, 'CUSTOMER', 100)
             ON DUPLICATE KEY UPDATE id=id`,
            [uniquePhone, displayName]
          );
        } catch (_ignore) {}
      }

      const orderId = `ord_${Date.now()}`;
      let subtotal = 0;
      const processedItems: any[] = [];
      let maxPrepTime = 15;

      if (!input || !Array.isArray(input.items) || input.items.length === 0) {
        throw new Error('No items in cart to place order');
      }

      const itemsToProcess = input.items;

      // 1. Process items and calculate subtotal
      for (const rawItemInput of itemsToProcess) {
        const itemInput = rawItemInput as any;
        let menuItem: any = null;
        try {
          const [menuRows] = await connection.query<RowDataPacket[]>('SELECT * FROM menu_items WHERE id = ?', [itemInput.menuItemId]);
          if (menuRows.length > 0) {
            menuItem = menuRows[0];
          }
        } catch (_e) {
          // Ignore menu row query failure
        }

        if (!menuItem) {
          menuItem = {
            id: itemInput.menuItemId,
            name: itemInput.name || 'Dish Item',
            price: itemInput.unitPrice || 0,
            inventory_status: 'AVAILABLE',
            prep_time_minutes: 15,
          };
        }

        const itemPrepMinutes = menuItem.prep_time_minutes ? Number(menuItem.prep_time_minutes) : 15;
        if (itemPrepMinutes > maxPrepTime) {
          maxPrepTime = itemPrepMinutes;
        }

        if (menuItem.inventory_status === 'SOLD_OUT') {
          throw new Error(`Dish '${menuItem.name}' is currently Sold Out.`);
        }

        const itemUnitPrice = Number(menuItem.price);
        let optionsTotal = 0;
        const selectedOptionsList: any[] = [];

        if (itemInput.selectedOptionIds && itemInput.selectedOptionIds.length > 0) {
          for (const optId of itemInput.selectedOptionIds) {
            const [optRows] = await connection.query<RowDataPacket[]>('SELECT * FROM customization_options WHERE id = ?', [optId]);
            if (optRows.length > 0) {
              const opt = optRows[0];
              optionsTotal += Number(opt.price);
              selectedOptionsList.push({ id: opt.id, name: opt.name, price: Number(opt.price) });
            }
          }
        }

        const itemSubtotal = (itemUnitPrice + optionsTotal) * itemInput.quantity;
        subtotal += itemSubtotal;

        processedItems.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          unitPrice: itemUnitPrice,
          quantity: itemInput.quantity,
          subtotal: itemSubtotal,
          customInstructions: itemInput.customInstructions || '',
          options: selectedOptionsList,
        });
      }

      // 2. Apply Coupon / Discount
      let discount = 0;
      if (input.couponCode) {
        const [offerRows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM offers WHERE code = ? AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())',
          [input.couponCode]
        );
        if (offerRows.length > 0) {
          const offer = offerRows[0];
          
          // Verify that this coupon hasn't been used by the user yet
          const [usedCouponRows] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as cnt FROM orders WHERE user_id = ? AND coupon_code = ?',
            [targetUserId, input.couponCode]
          );

          if (usedCouponRows[0].cnt === 0 && subtotal >= Number(offer.min_order_amount)) {
            if (offer.offer_type === 'PERCENTAGE') {
              discount = (subtotal * Number(offer.discount_percent)) / 100;
              if (offer.max_discount_amount > 0 && discount > Number(offer.max_discount_amount)) {
                discount = Number(offer.max_discount_amount);
              }
            } else if (offer.offer_type === 'FLAT' || offer.offer_type === 'FIRST_ORDER') {
              discount = Number(offer.discount_amount);
            }
          }
        }
      }

      // 3. Apply Reward Points Redemption ($1 per 10 points)
      let rewardPointsUsed = 0;
      if (input.redeemPoints && input.redeemPoints > 0) {
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT reward_points FROM users WHERE id = ?', [targetUserId]);
        const currentPoints = userRows[0]?.reward_points || 0;
        rewardPointsUsed = Math.min(currentPoints, input.redeemPoints);
        const pointsDiscount = rewardPointsUsed / 10;
        discount += pointsDiscount;

        // Deduct points from user
        await connection.query('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [rewardPointsUsed, targetUserId]);
        await connection.query(
          'INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date) VALUES (?, ?, ?, ?, ?, CURRENT_DATE)',
          [uuidv4(), targetUserId, orderId, rewardPointsUsed, 'REDEEMED']
        );
      }

      // 4. Calculate Tax (5%) and Service Charge (2.5%)
      const tax = (subtotal - discount) * 0.05;
      const serviceCharge = (subtotal - discount) * 0.025;
      const total = Math.max(0, subtotal - discount + tax + serviceCharge);

      // Earn 1 reward point for every $1 spent
      const rewardPointsEarned = Math.floor(total);

      // Default estimated preparation time
      const prepTimeMinutes = maxPrepTime;

      const safeOrderType = input.orderType || 'Pickup';
      const safePaymentMethod = input.paymentMethod || 'UPI';

      // 5. Insert Order Header
      await connection.query(
        `INSERT INTO orders 
          (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status, coupon_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, 'PAID', ?)`,
        [orderId, targetUserId, safeOrderType, subtotal, discount, tax, serviceCharge, rewardPointsEarned, rewardPointsUsed, total, prepTimeMinutes, safePaymentMethod, input.couponCode || null]
      );

      // 6. Insert Fulfillment Details
      try {
        if (input.orderType === 'Car Order' && input.carDetails) {
          await connection.query(
            'INSERT INTO order_fulfillment_car (order_id, car_number, car_model, parking_spot) VALUES (?, ?, ?, ?)',
            [orderId, input.carDetails.carNumber, input.carDetails.carModel, input.carDetails.parkingSpot || '']
          );
        } else if (input.orderType === 'Dine In' && input.dineInDetails) {
          await connection.query(
            'INSERT INTO order_fulfillment_dine_in (order_id, table_number, seat_number) VALUES (?, ?, ?)',
            [orderId, input.dineInDetails.tableNumber, input.dineInDetails.seatNumber || '']
          );
        } else if ((input.orderType === 'Pre Order' || input.orderType === 'Take Away') && input.preOrderDetails) {
          await connection.query(
            'INSERT INTO order_fulfillment_pre_order (order_id, scheduled_date, scheduled_time) VALUES (?, ?, ?)',
            [orderId, input.preOrderDetails.scheduledDate, input.preOrderDetails.scheduledTime]
          );
        }
      } catch (_fulErr) {
        // Ignore fulfillment insert failure
      }

      // 7. Insert Order Line Items & Selected Options
      for (const item of processedItems) {
        const orderItemId = uuidv4();
        await connection.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, custom_instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderItemId, orderId, item.menuItemId, item.name, item.unitPrice, item.quantity, item.subtotal, item.customInstructions]
        );

        if (Array.isArray(item.options)) {
          for (const opt of item.options) {
            try {
              await connection.query(
                'INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price) VALUES (?, ?, ?, ?)',
                [orderItemId, opt.id, opt.name, opt.price]
              );
            } catch (_optErr) {
              // Ignore option insert error
            }
          }
        }
      }

      await connection.commit();
      connection.release();

      let fetchedOrder: any = null;
      try {
        fetchedOrder = await this.getOrderById(orderId);
      } catch (_e) {
        // Fall back to memory object if DB re-query fails
      }

      try {
        await notificationService.createNotification(
          targetUserId,
          'Order Placed Successfully',
          `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed and is pending admin approval.`,
          'order'
        );
      } catch (_notifErr) {}

      if (fetchedOrder) return fetchedOrder;

      return {
        id: orderId,
        orderType: safeOrderType,
        subtotal,
        discount,
        tax,
        serviceCharge,
        total,
        status: 'Pending',
        paymentMethod: safePaymentMethod,
        items: processedItems,
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

  /**
   *
   * @param orderId
   */
  async getOrderById(orderId: string) {
    const [orders] = await dbPool.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return null;

    const order = orders[0];
    const [userRows] = await dbPool.query<RowDataPacket[]>('SELECT name, phone FROM users WHERE id = ?', [order.user_id]);
    const customer = userRows[0] || { name: 'Customer', phone: '' };

    // Get Fulfillment Details
    let fulfillmentDetails: any = null;
    if (order.order_type === 'Car Order') {
      const [cars] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_car WHERE order_id = ?', [orderId]);
      if (cars.length > 0) fulfillmentDetails = { carNumber: cars[0].car_number, carModel: cars[0].car_model, parkingSpot: cars[0].parking_spot };
    } else if (order.order_type === 'Dine In') {
      const [dines] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_dine_in WHERE order_id = ?', [orderId]);
      if (dines.length > 0) fulfillmentDetails = { tableNumber: dines[0].table_number, seatNumber: dines[0].seat_number };
    } else if (order.order_type === 'Pre Order' || order.order_type === 'Take Away') {
      const [pres] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_pre_order WHERE order_id = ?', [orderId]);
      if (pres.length > 0) fulfillmentDetails = { scheduledDate: pres[0].scheduled_date, scheduledTime: pres[0].scheduled_time };
    }

    // Get Line Items
    const [items] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const itemsList = await Promise.all(
      items.map(async (i) => {
        const [opts] = await dbPool.query<RowDataPacket[]>('SELECT option_name, option_price FROM order_item_options WHERE order_item_id = ?', [i.id]);
        return {
          id: i.id,
          menuItemId: i.menu_item_id,
          name: i.item_name,
          unitPrice: Number(i.unit_price),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
          customInstructions: i.custom_instructions,
          options: opts.map((o) => ({ name: o.option_name, price: Number(o.option_price) })),
        };
      })
    );

    return {
      id: order.id,
      userId: order.user_id,
      customerName: customer.name,
      customerPhone: customer.phone,
      orderType: order.order_type,
      fulfillmentDetails,
      items: itemsList,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      tax: Number(order.tax),
      serviceCharge: Number(order.service_charge),
      total: Number(order.total),
      rewardPointsEarned: order.reward_points_earned,
      rewardPointsUsed: order.reward_points_used,
      status: order.status as OrderStatus,
      estimatedPrepTimeMinutes: order.prep_time_minutes,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      cancellationReason: order.cancellation_reason,
      createdAt: order.created_at,
    };
  },

  /**
   *
   * @param orderId
   * @param status
   * @param cancellationReason
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, cancellationReason?: string, prepTimeMinutes?: number) {
    if (prepTimeMinutes !== undefined && prepTimeMinutes !== null) {
      await dbPool.query(
        'UPDATE orders SET status = ?, cancellation_reason = COALESCE(?, cancellation_reason), prep_time_minutes = ? WHERE id = ?',
        [status, cancellationReason || null, prepTimeMinutes, orderId]
      );
    } else {
      await dbPool.query(
        'UPDATE orders SET status = ?, cancellation_reason = COALESCE(?, cancellation_reason) WHERE id = ?',
        [status, cancellationReason || null, orderId]
      );
    }

    // If order completed, award reward points with 6-month expiry date
    if (status === 'Completed') {
      const [orders] = await dbPool.query<RowDataPacket[]>('SELECT user_id, reward_points_earned FROM orders WHERE id = ?', [orderId]);
      if (orders.length > 0) {
        const { user_id, reward_points_earned } = orders[0];
        if (reward_points_earned > 0) {
          await dbPool.query('UPDATE users SET reward_points = reward_points + ? WHERE id = ?', [reward_points_earned, user_id]);
          await dbPool.query(
            'INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date) VALUES (?, ?, ?, ?, ?, DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH))',
            [uuidv4(), user_id, orderId, reward_points_earned, 'EARNED']
          );
        }
      }
    }

    const finalOrder = await this.getOrderById(orderId);
    if (finalOrder) {
      try {
        let msg = `Your order #${orderId.slice(0, 8).toUpperCase()} status is now ${status}.`;
        if (status === 'Cancelled') msg = `Your order was cancelled. Reason: ${cancellationReason || 'N/A'}`;
        if (status === 'Completed') msg = 'Your order is ready! Enjoy your meal.';
        await notificationService.createNotification(finalOrder.userId, `Order ${status}`, msg, 'order');
      } catch (_notifErr) {}
    }
    
    return finalOrder;
  },

  /**
   *
   * @param orderId
   * @param minutes
   */
  async updateOrderPrepTime(orderId: string, minutes: PrepTimeMinutes) {
    await dbPool.query('UPDATE orders SET prep_time_minutes = ? WHERE id = ?', [minutes, orderId]);
    return this.getOrderById(orderId);
  },

  async partialRejectOrder(orderId: string, rejectedItemIds: string[]) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();

      const [orders] = await connection.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (orders.length === 0) {
        throw new Error('Order not found');
      }
      const order = orders[0];

      const [itemsToReject] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM order_items WHERE order_id = ? AND id IN (?)',
        [orderId, rejectedItemIds]
      );

      if (itemsToReject.length === 0) {
        throw new Error('No valid items selected for rejection');
      }

      await connection.query('DELETE FROM order_items WHERE order_id = ? AND id IN (?)', [orderId, rejectedItemIds]);
      await connection.query('DELETE FROM order_item_options WHERE order_item_id IN (?)', [rejectedItemIds]);

      const [remainingItems] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );

      let newSubtotal = 0;
      for (const item of remainingItems) {
        newSubtotal += Number(item.subtotal);
      }

      let newDiscount = 0;
      if (order.coupon_code) {
        const [offerRows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM offers WHERE code = ?',
          [order.coupon_code]
        );
        if (offerRows.length > 0) {
          const offer = offerRows[0];
          if (newSubtotal >= Number(offer.min_order_amount)) {
            if (offer.offer_type === 'PERCENTAGE') {
              newDiscount = (newSubtotal * Number(offer.discount_percent)) / 100;
              if (offer.max_discount_amount > 0 && newDiscount > Number(offer.max_discount_amount)) {
                newDiscount = Number(offer.max_discount_amount);
              }
            } else if (offer.offer_type === 'FLAT' || offer.offer_type === 'FIRST_ORDER') {
              newDiscount = Number(offer.discount_amount);
            }
          }
        }
      }

      const newTax = (newSubtotal - newDiscount) * 0.05;
      const newServiceCharge = (newSubtotal - newDiscount) * 0.025;
      const newTotal = Math.max(0, newSubtotal - newDiscount + newTax + newServiceCharge);

      const refundAmount = Number(order.total) - newTotal;

      await connection.query(
        `UPDATE orders 
         SET subtotal = ?, discount = ?, tax = ?, service_charge = ?, total = ?, status = 'Accepted' 
         WHERE id = ?`,
        [newSubtotal, newDiscount, newTax, newServiceCharge, newTotal, orderId]
      );

      await connection.commit();
      connection.release();

      const itemNames = itemsToReject.map(i => i.item_name).join(', ');
      const notifyMsg = `Partially Accepted: '${itemNames}' was/were out of stock. A refund of ₹${refundAmount.toFixed(2)} will be processed manually.`;
      try {
        await notificationService.createNotification(
          order.user_id,
          'Order Partially Accepted',
          notifyMsg,
          'order'
        );
      } catch (_e) {}

      return this.getOrderById(orderId);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

  /**
   *
   * @param userId
   */
  async getUserOrders(userId: string) {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return Promise.all(rows.map((r) => this.getOrderById(r.id)));
  },

  /**
   *
   * @param statusFilter
   */
  async getAllOrders(statusFilter?: string) {
    let sql = 'SELECT id FROM orders';
    const params: any[] = [];
    if (statusFilter) {
      sql += ' WHERE status = ?';
      params.push(statusFilter);
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await dbPool.query<RowDataPacket[]>(sql, params);
    return Promise.all(rows.map((r) => this.getOrderById(r.id)));
  },
};
