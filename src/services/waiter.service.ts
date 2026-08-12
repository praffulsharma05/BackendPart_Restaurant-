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
  async callWaiter(tableNumber: string, userId?: string, carNumber?: string) {
    const id = `wc_${Date.now()}`;
    await dbPool.query('INSERT INTO waiter_calls (id, table_number, user_id, status) VALUES (?, ?, ?, ?)', [
      id,
      tableNumber,
      userId || null,
      'PENDING',
    ]);

    if (userId && carNumber && carNumber.trim()) {
      try {
        const cleanCarNum = carNumber.trim();
        const [existing] = await dbPool.query<RowDataPacket[]>(
          'SELECT id FROM saved_vehicles WHERE user_id = ? AND car_number = ?',
          [userId, cleanCarNum]
        );
        if (existing.length === 0) {
          const vehId = `v_${Date.now()}`;
          await dbPool.query(
            'INSERT INTO saved_vehicles (id, user_id, car_number, car_model, is_default) VALUES (?, ?, ?, ?, ?)',
            [vehId, userId, cleanCarNum, 'Car', true]
          );
        }
      } catch (vehErr) {
        console.error('[WaiterService] Error saving vehicle for user:', vehErr);
      }
    }

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
    return notificationService.acknowledgeNotification(id);
  },
};
