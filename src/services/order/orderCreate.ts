import { dbPool } from '../../config/db';
import { CreateOrderInput } from '../../types';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../notification.service';
import { initTables } from './orderInit';
import { getOrderById } from './orderRead';
import { ORDER_STRINGS } from './orderStrings';
import { resolveOrderUser } from './orderHelpers';
import { processOrderDiscounts } from './orderDiscounts';

import { rewardService } from '../reward.service';

export async function createOrder(userId: string, input: CreateOrderInput) {
  await initTables();

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const targetUserId = await resolveOrderUser(connection, userId, input);

    const uniqueSuffix = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${uniqueSuffix}`;
    const orderToken = `otk_${uuidv4().replace(/-/g, '')}`;
    let subtotal = 0;
    const processedItems: any[] = [];
    let maxPrepTime = 15;

    if (!input || !Array.isArray(input.items) || input.items.length === 0) {
      throw new Error(ORDER_STRINGS.ERRORS.NO_ITEMS);
    }

    for (const rawItemInput of input.items) {
      const itemInput = rawItemInput as any;
      let menuItem: any = null;
      try {
        const [menuRows] = await connection.query<RowDataPacket[]>('SELECT * FROM menu_items WHERE id = ?', [itemInput.menuItemId]);
        if (menuRows.length > 0) {
          menuItem = menuRows[0];
        }
      } catch (_e) {}

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
        customInstructions:
          itemInput.customInstructions ||
          itemInput.specialInstructions ||
          itemInput.specialRequest ||
          itemInput.instructions ||
          itemInput.notes ||
          '',
        options: selectedOptionsList,
      });
    }

    const { discount, rewardPointsUsed } = await processOrderDiscounts(connection, input, targetUserId, subtotal, orderId);

    const tax = 0;
    const serviceCharge = 0;
    const total = Math.max(0, subtotal - discount);

    let rewardPointsEarned = 0;
    try {
      const settings = await rewardService.getRewardSettings();
      if (settings && settings.isActive && settings.rewardPercentage > 0) {
        const rawPoints = Math.floor((total * settings.rewardPercentage) / 100);
        rewardPointsEarned = Math.min(rawPoints, settings.maxPointsPerOrder);
      }
    } catch (_e) {
      rewardPointsEarned = 0;
    }
    const prepTimeMinutes = maxPrepTime;

    const safeOrderType = input.orderType || 'Pickup';
    const safePaymentMethod = input.paymentMethod || 'UPI';
    let specialInstructions =
      input.specialInstructions ||
      (input as any).customRequests ||
      (input as any).instructions ||
      (input as any).notes ||
      (input.carDetails as any)?.notes ||
      (input.carDetails as any)?.specialInstructions ||
      (input.dineInDetails as any)?.notes ||
      (input.dineInDetails as any)?.specialInstructions ||
      (input.preOrderDetails as any)?.notes ||
      (input.preOrderDetails as any)?.specialInstructions ||
      null;

    await connection.query(
      `INSERT INTO orders 
        (id, user_id, order_type, subtotal, discount, tax, service_charge, reward_points_earned, reward_points_used, total, status, prep_time_minutes, payment_method, payment_status, coupon_code, payment_screenshot_url, order_token, special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, 'PAID', ?, ?, ?, ?)`,
      [orderId, targetUserId, safeOrderType, subtotal, discount, tax, serviceCharge, rewardPointsEarned, rewardPointsUsed, total, prepTimeMinutes, safePaymentMethod, input.couponCode || null, input.paymentScreenshotUrl || null, orderToken, specialInstructions]
    );

    try {
      if (input.orderType === 'Car Order' && input.carDetails) {
        await connection.query(
          'INSERT INTO order_fulfillment_car (order_id, car_number, car_model, parking_spot) VALUES (?, ?, ?, ?)',
          [orderId, input.carDetails.carNumber, input.carDetails.carModel, input.carDetails.parkingSpot || '']
        );

        if (targetUserId && input.carDetails.carNumber && input.carDetails.carNumber.trim()) {
          try {
            const cleanCar = input.carDetails.carNumber.trim();
            const carModelVal = input.carDetails.carModel || 'Car';
            const [existingVeh] = await connection.query<RowDataPacket[]>(
              'SELECT id FROM saved_vehicles WHERE user_id = ? AND car_number = ?',
              [targetUserId, cleanCar]
            );
            if (existingVeh.length === 0) {
              const vehId = `v_${Date.now()}`;
              await connection.query(
                'INSERT INTO saved_vehicles (id, user_id, car_number, car_model, is_default) VALUES (?, ?, ?, ?, ?)',
                [vehId, targetUserId, cleanCar, carModelVal, true]
              );
            }
          } catch (_vehSaveErr) {}
        }
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
    } catch (_fulErr) {}

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
          } catch (_optErr) {}
        }
      }
    }

    await connection.commit();
    connection.release();

    let fetchedOrder: any = null;
    try {
      fetchedOrder = await getOrderById(orderId);
    } catch (_e) {}

    try {
      await notificationService.createNotification(
        targetUserId,
        ORDER_STRINGS.NOTIFICATIONS.PLACED_TITLE,
        ORDER_STRINGS.NOTIFICATIONS.PLACED_BODY(orderId),
        'order'
      );

      // Send live alert to ADMIN notification feed with customer special instructions
      const noteSuffix = specialInstructions ? ` | Instruction: "${specialInstructions}"` : '';
      await notificationService.createNotification(
        'ADMIN',
        `New ${safeOrderType} Order #${orderId.slice(0, 8).toUpperCase()}`,
        `New ${safeOrderType} order placed for ₹${total.toFixed(2)}.${noteSuffix}`,
        'USER_EVENT'
      );
    } catch (_notifErr) {}

    if (fetchedOrder) {
      return { ...fetchedOrder, orderToken };
    }

    return {
      id: orderId,
      orderToken,
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
