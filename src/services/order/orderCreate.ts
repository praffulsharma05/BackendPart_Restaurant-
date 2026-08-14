import { dbPool } from '../../config/db';
import { CreateOrderInput } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../notification.service';
import { initTables } from './orderInit';
import { getOrderById } from './orderRead';
import { ORDER_STRINGS } from './orderStrings';
import { resolveOrderUser } from './orderHelpers';
import { processOrderDiscounts } from './orderDiscounts';
import { processOrderItems } from './orderItemProcessor';
import { processOrderFulfillment } from './orderFulfillment';
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

    const { processedItems, subtotal, maxPrepTime } = await processOrderItems(connection, input);

    const { discount, rewardPointsUsed } = await processOrderDiscounts(connection, input, targetUserId, subtotal, orderId);

    const tax = 0;
    const serviceCharge = 0;
    const total = Math.max(0, subtotal - discount);

    let rewardPointsEarned = 0;
    try {
      const settings = await rewardService.getRewardSettings();
      if (settings && settings.isActive && settings.rewardPercentage > 0) {
        const rawPoints = Math.floor((total * settings.rewardPercentage) / 100);
        rewardPointsEarned = settings.maxPointsPerOrder > 0
          ? Math.min(rawPoints, settings.maxPointsPerOrder)
          : rawPoints;
      }
    } catch (_e) {
      rewardPointsEarned = 0;
    }
    const prepTimeMinutes = maxPrepTime;

    const safeOrderType = input.orderType || 'Pickup';
    const safePaymentMethod = input.paymentMethod || 'UPI';
    const specialInstructions =
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

    await processOrderFulfillment(connection, orderId, targetUserId, input);

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

