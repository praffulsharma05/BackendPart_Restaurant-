import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { OrderStatus } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrl';

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
  let calculatedSubtotal = 0;
  const itemsList = await Promise.all(
    items.map(async (i) => {
      const [opts] = await dbPool.query<RowDataPacket[]>('SELECT option_name, option_price FROM order_item_options WHERE order_item_id = ?', [i.id]);
      const mappedOptions = opts.map((o) => ({ name: o.option_name, price: Number(o.option_price) }));
      const optionsTotal = mappedOptions.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

      let unitPrice = Number(i.unit_price);
      if (unitPrice <= 0 && i.menu_item_id) {
        try {
          const [mRows] = await dbPool.query<RowDataPacket[]>('SELECT price FROM menu_items WHERE id = ?', [i.menu_item_id]);
          if (mRows.length > 0 && Number(mRows[0].price) > 0) {
            unitPrice = Number(mRows[0].price);
          } else {
            const [vRows] = await dbPool.query<RowDataPacket[]>(
              'SELECT variant_price FROM menu_item_variants WHERE menu_item_id = ? AND is_deleted = FALSE ORDER BY variant_price ASC LIMIT 1',
              [i.menu_item_id]
            );
            if (vRows.length > 0) {
              unitPrice = Number(vRows[0].variant_price);
            }
          }
        } catch (_err) {}
      }

      const qty = Number(i.quantity) || 1;
      const itemSubtotal = Number(i.subtotal) > 0 ? Number(i.subtotal) : (unitPrice + optionsTotal) * qty;
      calculatedSubtotal += itemSubtotal;

      return {
        id: i.id,
        menuItemId: i.menu_item_id,
        name: i.item_name,
        unitPrice: unitPrice,
        quantity: qty,
        subtotal: itemSubtotal,
        customInstructions: i.custom_instructions || '',
        options: mappedOptions,
      };
    })
  );

  const finalSubtotal = Number(order.subtotal) > 0 ? Number(order.subtotal) : calculatedSubtotal;
  const finalDiscount = Number(order.discount) || 0;
  const finalTax = Number(order.tax) || 0;
  const finalServiceCharge = Number(order.service_charge) || 0;
  const finalTotal = Number(order.total) > 0 ? Number(order.total) : Math.max(0, finalSubtotal - finalDiscount + finalTax + finalServiceCharge);

  return {
    id: order.id,
    userId: order.user_id,
    customerName: customer.name,
    customerPhone: customer.phone,
    orderType: order.order_type || (fulfillmentDetails?.tableNumber ? 'Dine In' : fulfillmentDetails?.carNumber ? 'Car Order' : 'Pickup'),
    fulfillmentDetails: fulfillmentDetails || null,
    items: itemsList,
    subtotal: finalSubtotal,
    discount: finalDiscount,
    tax: finalTax,
    serviceCharge: finalServiceCharge,
    total: finalTotal,
    rewardPointsEarned: order.reward_points_earned,
    rewardPointsUsed: order.reward_points_used,
    status: order.status as OrderStatus,
    estimatedPrepTimeMinutes: order.prep_time_minutes,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    cancellationReason: order.cancellation_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    paymentScreenshotUrl: normalizeImageUrl(order.payment_screenshot_url),
    orderToken: order.order_token,
    specialInstructions: order.special_instructions || '',
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
