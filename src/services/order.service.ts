import { dbPool } from '../config/db';
import { CreateOrderInput, OrderStatus, PrepTimeMinutes } from '../types';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const orderService = {
  async createOrder(userId: string, input: CreateOrderInput) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();

      const orderId = `ord_${Date.now()}`;
      let subtotal = 0;
      const processedItems: any[] = [];

      // 1. Process items and calculate subtotal
      for (const itemInput of input.items) {
        const [menuRows] = await connection.query<RowDataPacket[]>('SELECT * FROM menu_items WHERE id = ?', [itemInput.menuItemId]);
        if (menuRows.length === 0) {
          throw new Error(`Menu item with ID '${itemInput.menuItemId}' not found.`);
        }

        const menuItem = menuRows[0];
        if (menuItem.inventory_status === 'SOLD_OUT') {
          throw new Error(`Dish '${menuItem.name}' is currently Sold Out.`);
        }

        let itemUnitPrice = Number(menuItem.price);
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
          if (subtotal >= Number(offer.min_order_amount)) {
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
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT reward_points FROM users WHERE id = ?', [userId]);
        const currentPoints = userRows[0]?.reward_points || 0;
        rewardPointsUsed = Math.min(currentPoints, input.redeemPoints);
        const pointsDiscount = rewardPointsUsed / 10;
        discount += pointsDiscount;

        // Deduct points from user
        await connection.query('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [rewardPointsUsed, userId]);
        await connection.query(
          'INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date) VALUES (?, ?, ?, ?, ?, CURRENT_DATE)',
          [uuidv4(), userId, orderId, rewardPointsUsed, 'REDEEMED']
        );
      }

      // 4. Calculate Tax (5%) and Service Charge (2.5%)
      const tax = (subtotal - discount) * 0.05;
      const serviceCharge = (subtotal - discount) * 0.025;
      const total = Math.max(0, subtotal - discount + tax + serviceCharge);

      // Earn 1 reward point for every $1 spent
      const rewardPointsEarned = Math.floor(total);

      // Default estimated preparation time
      const prepTimeMinutes = 20;

      // 5. Insert Order Header
      await connection.query(
        `INSERT INTO orders 
          (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, 'PAID')`,
        [orderId, userId, input.orderType, subtotal, discount, tax, serviceCharge, rewardPointsEarned, rewardPointsUsed, total, prepTimeMinutes, input.paymentMethod]
      );

      // 6. Insert Fulfillment Details
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

      // 7. Insert Order Line Items & Selected Options
      for (const item of processedItems) {
        const orderItemId = uuidv4();
        await connection.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, custom_instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderItemId, orderId, item.menuItemId, item.name, item.unitPrice, item.quantity, item.subtotal, item.customInstructions]
        );

        for (const opt of item.options) {
          await connection.query(
            'INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price) VALUES (?, ?, ?, ?)',
            [orderItemId, opt.id, opt.name, opt.price]
          );
        }
      }

      await connection.commit();
      connection.release();

      return this.getOrderById(orderId);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

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

  async updateOrderStatus(orderId: string, status: OrderStatus, cancellationReason?: string) {
    await dbPool.query(
      'UPDATE orders SET status = ?, cancellation_reason = COALESCE(?, cancellation_reason) WHERE id = ?',
      [status, cancellationReason || null, orderId]
    );

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

    return this.getOrderById(orderId);
  },

  async updateOrderPrepTime(orderId: string, minutes: PrepTimeMinutes) {
    await dbPool.query('UPDATE orders SET prep_time_minutes = ? WHERE id = ?', [minutes, orderId]);
    return this.getOrderById(orderId);
  },

  async getUserOrders(userId: string) {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return Promise.all(rows.map((r) => this.getOrderById(r.id)));
  },

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
