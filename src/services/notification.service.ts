import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const notificationService = {
  /**
   *
   * @param userId
   * @param title
   * @param message
   * @param type
   */
  async createNotification(userId: string, title: string, message: string, type: string = 'GENERAL') {
    const id = uuidv4();
    await dbPool.query('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)', [
      id,
      userId,
      title,
      message,
      type,
    ]);
    return { id, userId, title, message, type, isRead: false, createdAt: new Date() };
  },

  /**
   *
   * @param userId
   */
  async getUserNotifications(userId: string) {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM notifications WHERE user_id = ? OR user_id = "ALL" ORDER BY created_at DESC', [userId]);
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: Boolean(r.is_read),
      createdAt: r.created_at,
    }));
  },

  /**
   *
   * @param id
   */
  async markAsRead(id: string) {
    await dbPool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    return { id, isRead: true };
  },

  /**
   * Delete a notification by id
   * @param id
   */
  async deleteNotification(id: string) {
    await dbPool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return { id, deleted: true };
  },
};
