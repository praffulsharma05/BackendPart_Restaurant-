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
   * Send notification to all admin accounts in system
   */
  async notifyAdmins(title: string, message: string, type: string = 'USER_EVENT') {
    try {
      const [adminRows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM users WHERE role = "ADMIN"');
      if (adminRows.length === 0) {
        console.warn('[NotificationService] No admin users found in database to notify');
        return;
      }
      for (const admin of adminRows) {
        await this.createNotification(admin.id, title, message, type);
      }
    } catch (err) {
      console.error('[NotificationService] Error notifying admins:', err);
    }
  },

  /**
   * Get notifications for user or admin
   * @param userId
   * @param role
   */
  async getUserNotifications(userId: string, role?: string) {
    const isAdmin = role === 'ADMIN';

    let sql = `SELECT * FROM notifications WHERE user_id = ? OR user_id = "ALL"`;
    const params: any[] = [userId];

    if (isAdmin) {
      sql = `SELECT * FROM notifications WHERE user_id = ? OR user_id = "ALL" OR user_id = "ADMIN"`;
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await dbPool.query<RowDataPacket[]>(sql, params);

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

  /**
   * Clear / delete all notifications for a user or system
   * @param userId
   */
  async clearAllNotifications(userId: string) {
    await dbPool.query('DELETE FROM notifications WHERE user_id = ? OR user_id = "ALL" OR user_id = "ADMIN"', [userId]);
    return { cleared: true };
  },
};
