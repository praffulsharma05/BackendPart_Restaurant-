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
      sql = `SELECT * FROM notifications WHERE user_id = ? OR user_id = "ADMIN" OR (user_id = "ALL" AND type != 'MESSAGE')`;
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
   * Acknowledge a notification & dispatch confirmation to customer
   * @param id
   * @param customMessage
   */
  async acknowledgeNotification(id: string, customMessage?: string) {
    try {
      // 1. Check notifications table
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM notifications WHERE id = ?', [id]);
      const notif = rows[0];

      if (notif) {
        if (!notif.is_read) {
          await dbPool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
          const targetUser = (notif.user_id !== 'ADMIN' && notif.user_id !== 'ALL') ? notif.user_id : 'ALL';
          const notifTitle = notif.title ? ` (Re: ${notif.title})` : '';
          const body = customMessage || `Admin acknowledged your message${notifTitle}. Your request has been attended to and marked as done by restaurant staff.`;
          
          await this.createNotification(
            targetUser,
            'Admin Acknowledged Your Message',
            body,
            'MESSAGE'
          );
        }
        return { id, acknowledged: true };
      }

      // 2. Fallback to waiter_calls table
      const [waiterRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM waiter_calls WHERE id = ?', [id]);
      const call = waiterRows[0];
      if (call) {
        if (call.status !== 'ATTENDED') {
          await dbPool.query('UPDATE waiter_calls SET status = ? WHERE id = ?', ['ATTENDED', id]);
          const targetUser = call.user_id || 'ALL';
          const tableText = call.table_number ? ` (${call.table_number})` : '';
          await this.createNotification(
            targetUser,
            'Admin Acknowledged Your Message',
            `Admin acknowledged your message. Your request${tableText} has been attended to and marked as done by restaurant staff.`,
            'MESSAGE'
          );
        }
        return { id, acknowledged: true };
      }
    } catch (_notifErr) {}
    return { id, acknowledged: true };
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
