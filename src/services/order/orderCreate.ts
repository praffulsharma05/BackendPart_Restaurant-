import { dbPool } from '../../config/db';
import { CreateOrderInput } from '../../types';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../notification.service';
import { initTables } from './orderInit';
import { getOrderById } from './orderRead';
import { ORDER_STRINGS } from './orderStrings';

export async function createOrder(userId: string, input: CreateOrderInput) {
  await initTables();

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Ensure user row exists to prevent MySQL Foreign Key constraint failure (orders_ibfk_1)
    let targetUserId = userId && userId.trim() ? userId.trim() : null;
    try {
      const uniquePhone = (input.customerPhone || '').trim();
      let userRow: any = null;

      // 1. Check if we have an existing user with this phone number to reuse their user ID
      if (uniquePhone) {
        const [byPhone] = await connection.query<RowDataPacket[]>('SELECT id, name, role FROM users WHERE phone = ?', [uniquePhone]);
        if (byPhone.length > 0) {
          userRow = byPhone[0];
          targetUserId = userRow.id;
        }
      }

      // 2. If no user by phone, check if the provided targetUserId exists
      if (!userRow && targetUserId) {
        const [byId] = await connection.query<RowDataPacket[]>('SELECT id, name, role FROM users WHERE id = ?', [targetUserId]);
        if (byId.length > 0) {
          userRow = byId[0];
        }
      }

      // 3. If still no user exists, create a new customer record
      if (!userRow) {
        if (!targetUserId || targetUserId === 'u101') {
          targetUserId = `u_${Date.now()}`;
        }
        const finalPhone = uniquePhone || `+91${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const displayName = input.customerName || 'Gourmet Customer';
        
        await connection.query(
          `INSERT INTO users (id, phone, name, role, reward_points) 
           VALUES (?, ?, ?, 'CUSTOMER', 100)`,
          [targetUserId, finalPhone, displayName]
        );
      } else {
        // If the user already exists, only update their name if they are a CUSTOMER and currently have a placeholder name
        if (input.customerName && userRow.role === 'CUSTOMER') {
          const currentName = userRow.name || '';
          if (!currentName || currentName === 'Gourmet Customer' || currentName.startsWith('Customer')) {
            await connection.query('UPDATE users SET name = ? WHERE id = ?', [input.customerName, targetUserId]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to create/resolve order user:', err);
      // Fallback to a safe known user if absolutely necessary, but generate a unique phone to avoid conflicts
      targetUserId = `u_fallback_${Date.now()}`;
      const fallbackPhone = `+91_fb_${Date.now()}`;
      const displayName = input.customerName || 'Gourmet Customer';
      try {
        await connection.query(
          `INSERT INTO users (id, phone, name, role, reward_points) 
           VALUES (?, ?, ?, 'CUSTOMER', 100)`,
          [targetUserId, fallbackPhone, displayName]
        );
      } catch (_ignore) {}
    }

    const orderId = `ord_${Date.now()}`;
    let subtotal = 0;
    const processedItems: any[] = [];
    let maxPrepTime = 15;

    if (!input || !Array.isArray(input.items) || input.items.length === 0) {
      throw new Error(ORDER_STRINGS.ERRORS.NO_ITEMS);
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
        throw new Error(ORDER_STRINGS.ERRORS.SOLD_OUT(menuItem.name));
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
          [targetUserId || 'u101', input.couponCode]
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
      const [userRows] = await connection.query<RowDataPacket[]>('SELECT reward_points FROM users WHERE id = ?', [targetUserId || 'u101']);
      const currentPoints = userRows[0]?.reward_points || 0;
      rewardPointsUsed = Math.min(currentPoints, input.redeemPoints);
      const pointsDiscount = rewardPointsUsed / 10;
      discount += pointsDiscount;

      // Deduct points from user
      await connection.query('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [rewardPointsUsed, targetUserId || 'u101']);
      await connection.query(
        'INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date) VALUES (?, ?, ?, ?, ?, CURRENT_DATE)',
        [uuidv4(), targetUserId || 'u101', orderId, rewardPointsUsed, 'REDEEMED']
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
        (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status, coupon_code, payment_screenshot_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, 'PAID', ?, ?)`,
      [orderId, targetUserId || 'u101', safeOrderType, subtotal, discount, tax, serviceCharge, rewardPointsEarned, rewardPointsUsed, total, prepTimeMinutes, safePaymentMethod, input.couponCode || null, input.paymentScreenshotUrl || null]
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
      fetchedOrder = await getOrderById(orderId);
    } catch (_e) {
      // Fall back to memory object if DB re-query fails
    }

    try {
      await notificationService.createNotification(
        targetUserId || 'u101',
        ORDER_STRINGS.NOTIFICATIONS.PLACED_TITLE,
        ORDER_STRINGS.NOTIFICATIONS.PLACED_BODY(orderId),
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
}
