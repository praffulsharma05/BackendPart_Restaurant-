import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';

export const notificationController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      const notifications = await notificationService.getUserNotifications(userId);
      return sendSuccess(res, 'Notifications retrieved', notifications);
    } catch (error) {
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAsRead(req.params.id);
      return sendSuccess(res, 'Notification marked as read', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a notification permanently
   * @param req
   * @param res
   * @param next
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteNotification(req.params.id);
      return sendSuccess(res, 'Notification deleted', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear all notifications permanently
   * @param req
   * @param res
   * @param next
   */
  async clearAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      const result = await notificationService.clearAllNotifications(userId);
      return sendSuccess(res, 'All notifications cleared successfully', result);
    } catch (error) {
      next(error);
    }
  },
};
