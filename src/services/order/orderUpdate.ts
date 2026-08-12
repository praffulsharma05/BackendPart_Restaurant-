import { dbPool } from '../../config/db';
import { OrderStatus, PrepTimeMinutes } from '../../types';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../notification.service';
import { getOrderById } from './orderRead';
import { ORDER_STRINGS } from './orderStrings';

export async function updateOrderStatus(orderId: string, status: OrderStatus, cancellationReason?: string, prepTimeMinutes?: number) {
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

  const finalOrder = await getOrderById(orderId);
  if (finalOrder) {
    try {
      let title = ORDER_STRINGS.NOTIFICATIONS.STATUS_UPDATED_TITLE(status);
      let msg = ORDER_STRINGS.NOTIFICATIONS.STATUS_UPDATED_BODY(orderId, status);
      if (status === 'Accepted') {
        title = ORDER_STRINGS.NOTIFICATIONS.ACCEPTED_TITLE;
        msg = ORDER_STRINGS.NOTIFICATIONS.ACCEPTED_BODY(orderId, prepTimeMinutes);
      } else if (status === 'Preparing') {
        title = ORDER_STRINGS.NOTIFICATIONS.PREPARING_TITLE;
        msg = ORDER_STRINGS.NOTIFICATIONS.PREPARING_BODY(orderId);
      } else if (status === 'Cancelled') {
        title = ORDER_STRINGS.NOTIFICATIONS.REJECTED_TITLE;
        msg = ORDER_STRINGS.NOTIFICATIONS.REJECTED_BODY(orderId, cancellationReason);
      } else if (status === 'Completed') {
        title = 'Order Completed 🍽️';
        msg = ORDER_STRINGS.NOTIFICATIONS.COMPLETED_BODY;
      }
      await notificationService.createNotification(
        finalOrder.userId,
        title,
        msg,
        'order'
      );
    } catch (_notifErr) {}
  }
  
  return finalOrder;
}

export async function updateOrderPrepTime(orderId: string, minutes: PrepTimeMinutes) {
  await dbPool.query('UPDATE orders SET prep_time_minutes = ? WHERE id = ?', [minutes, orderId]);
  return getOrderById(orderId);
}

export async function partialRejectOrder(orderId: string, rejectedItemIds: string[]) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      throw new Error(ORDER_STRINGS.ERRORS.ORDER_NOT_FOUND);
    }
    const order = orders[0];

    const [itemsToReject] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM order_items WHERE order_id = ? AND id IN (?)',
      [orderId, rejectedItemIds]
    );

    if (itemsToReject.length === 0) {
      throw new Error(ORDER_STRINGS.ERRORS.NO_VALID_ITEMS);
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

    const newTax = 0;
    const newServiceCharge = 0;
    const newTotal = Math.max(0, newSubtotal - newDiscount);

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
    const notifyMsg = ORDER_STRINGS.NOTIFICATIONS.PARTIAL_REJECT_BODY(itemNames, refundAmount);
    try {
      await notificationService.createNotification(
        order.user_id,
        ORDER_STRINGS.NOTIFICATIONS.PARTIAL_REJECT_TITLE,
        notifyMsg,
        'order'
      );
    } catch (_e) {}

    return getOrderById(orderId);
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}
