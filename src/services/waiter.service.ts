import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from './notification.service';

export const waiterService = {
  /**
   *
   * @param tableNumber
   * @param userId
   */
  async callWaiter(tableNumber: string, userId?: string) {
    const id = `wc_${Date.now()}`;
    await dbPool.query('INSERT INTO waiter_calls (id, table_number, user_id, status) VALUES (?, ?, ?, ?)', [
      id,
      tableNumber,
      userId || null,
      'PENDING',
    ]);
    try {
      await notificationService.createNotification(
        'ALL',
        'Attendant Summoned',
        `Request at location: ${tableNumber}`,
        'waiter-call'
      );
    } catch (_notifErr) {}
    return { id, tableNumber, status: 'PENDING', createdAt: new Date() };
  },

  /**
   *
   */
  async getPendingWaiterCalls() {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM waiter_calls WHERE status = ? ORDER BY created_at ASC', ['PENDING']);
    return rows.map((r) => ({
      id: r.id,
      tableNumber: r.table_number,
      userId: r.user_id,
      status: r.status,
      createdAt: r.created_at,
    }));
  },

  /**
   *
   * @param id
   */
  async attendWaiterCall(id: string) {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM waiter_calls WHERE id = ?', [id]);
      const call = rows[0];
      if (!call) {
        return { id, status: 'NOT_FOUND' };
      }

      if (call.status === 'ATTENDED') {
        return { id, status: 'ATTENDED' };
      }

      await dbPool.query('UPDATE waiter_calls SET status = ? WHERE id = ?', ['ATTENDED', id]);

      const targetUser = call.user_id || 'ALL';
      const tableText = call.table_number ? ` (${call.table_number})` : '';
      await notificationService.createNotification(
        targetUser,
        'Admin Acknowledged Your Message',
        `Admin acknowledged your message. Your request${tableText} has been attended to and marked as done by restaurant staff.`,
        'MESSAGE'
      );
    } catch (_notifErr) {}
    return { id, status: 'ATTENDED' };
  },
};
