import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const analyticsService = {
  /**
   *
   */
  async getDashboardSummary() {
    // 1. Daily revenue (orders created today with status not Cancelled)
    const [dailyRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total), 0) as dailyRevenue, COUNT(*) as dailyOrders 
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE() AND status != 'Cancelled'`
    );

    // 2. Monthly revenue
    const [monthlyRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total), 0) as monthlyRevenue, COUNT(*) as monthlyOrders 
       FROM orders 
       WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND status != 'Cancelled'`
    );

    // 3. Total registered customers
    const [customerRows] = await dbPool.query<RowDataPacket[]>('SELECT COUNT(*) as totalCustomers FROM users WHERE role = "CUSTOMER"');

    // 4. Cancelled orders count
    const [cancelledRows] = await dbPool.query<RowDataPacket[]>("SELECT COUNT(*) as cancelledCount FROM orders WHERE status = 'Cancelled'");

    return {
      dailyRevenue: Number(dailyRows[0].dailyRevenue),
      dailyOrdersCount: Number(dailyRows[0].dailyOrders),
      monthlyRevenue: Number(monthlyRows[0].monthlyRevenue),
      monthlyOrdersCount: Number(monthlyRows[0].monthlyOrders),
      totalCustomers: Number(customerRows[0].totalCustomers),
      cancelledOrdersCount: Number(cancelledRows[0].cancelledCount),
    };
  },

  /**
   *
   * @param limit
   */
  async getMostOrderedDishes(limit: number = 10) {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT menu_item_id, item_name, SUM(quantity) as totalQuantitySold, SUM(subtotal) as totalRevenueGenerated
       FROM order_items
       GROUP BY menu_item_id, item_name
       ORDER BY totalQuantitySold DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((r) => ({
      menuItemId: r.menu_item_id,
      itemName: r.item_name,
      totalQuantitySold: Number(r.totalQuantitySold),
      totalRevenueGenerated: Number(r.totalRevenueGenerated),
    }));
  },

  /**
   *
   */
  async getPeakOrderingHours() {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT HOUR(created_at) as hourOfDay, COUNT(*) as ordersCount
       FROM orders
       GROUP BY HOUR(created_at)
       ORDER BY hourOfDay ASC`
    );

    return rows.map((r) => ({
      hourOfDay: r.hourOfDay,
      timeLabel: `${r.hourOfDay.toString().padStart(2, '0')}:00`,
      ordersCount: Number(r.ordersCount),
    }));
  },

  /**
   *
   */
  async getCancelledOrdersAnalytics() {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT id, user_id, order_type, total, cancellation_reason, created_at
       FROM orders
       WHERE status = 'Cancelled'
       ORDER BY created_at DESC
       LIMIT 50`
    );

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      orderType: r.order_type,
      totalAmount: Number(r.total),
      cancellationReason: r.cancellation_reason || 'No reason provided',
      createdAt: r.created_at,
    }));
  },
};
