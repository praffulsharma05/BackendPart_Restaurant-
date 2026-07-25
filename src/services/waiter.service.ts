import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const waiterService = {
  async callWaiter(tableNumber: string, userId?: string) {
    const id = `wc_${Date.now()}`;
    await dbPool.query('INSERT INTO waiter_calls (id, table_number, user_id, status) VALUES (?, ?, ?, ?)', [
      id,
      tableNumber,
      userId || null,
      'PENDING',
    ]);
    return { id, tableNumber, status: 'PENDING', createdAt: new Date() };
  },

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

  async attendWaiterCall(id: string) {
    await dbPool.query('UPDATE waiter_calls SET status = ? WHERE id = ?', ['ATTENDED', id]);
    return { id, status: 'ATTENDED' };
  },
};
