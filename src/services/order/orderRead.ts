import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { OrderStatus } from '../../types';

export async function getOrderById(orderId: string) {
  const [orders] = await dbPool.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (orders.length === 0) return null;

  const order = orders[0];
  const [userRows] = await dbPool.query<RowDataPacket[]>('SELECT name, phone FROM users WHERE id = ?', [order.user_id]);
  const customer = userRows[0] || { name: 'Customer', phone: '' };

  // Get Fulfillment Details
  let fulfillmentDetails: any = null;
  if (order.order_type === 'Car Order') {
    const [cars] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_car WHERE order_id = ?', [orderId]);
    if (cars.length > 0) {
      fulfillmentDetails = { carNumber: cars[0].car_number, carModel: cars[0].car_model, parkingSpot: cars[0].parking_spot };
    }
  } else if (order.order_type === 'Dine In') {
    const [dines] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_dine_in WHERE order_id = ?', [orderId]);
    if (dines.length > 0) {
      fulfillmentDetails = { tableNumber: dines[0].table_number, seatNumber: dines[0].seat_number };
    }
  } else if (order.order_type === 'Pre Order' || order.order_type === 'Take Away') {
    const [pres] = await dbPool.query<RowDataPacket[]>('SELECT * FROM order_fulfillment_pre_order WHERE order_id = ?', [orderId]);
    if (pres.length > 0) {
      fulfillmentDetails = { scheduledDate: pres[0].scheduled_date, scheduledTime: pres[0].scheduled_time };
    }
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
    updatedAt: order.updated_at,
    paymentScreenshotUrl: order.payment_screenshot_url,
  };
}

export async function getUserOrders(userId: string) {
  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  const results = await Promise.all(
    rows.map(async (r) => {
      try {
        return await getOrderById(r.id);
      } catch (error) {
        console.error(`Error loading order ${r.id}:`, error);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function getAllOrders(statusFilter?: string) {
  let sql = 'SELECT id FROM orders';
  const params: any[] = [];
  if (statusFilter) {
    sql += ' WHERE status = ?';
    params.push(statusFilter);
  }
  sql += ' ORDER BY created_at DESC';

  const [rows] = await dbPool.query<RowDataPacket[]>(sql, params);
  const results = await Promise.all(
    rows.map(async (r) => {
      try {
        return await getOrderById(r.id);
      } catch (error) {
        console.error(`Error loading order ${r.id}:`, error);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
