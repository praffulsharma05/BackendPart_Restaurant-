import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

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
      const role = req.user?.role;
      logger.info('[Notification] Fetching user notifications', { userId, role });
      const notifications = await notificationService.getUserNotifications(userId, role);
      return sendSuccess(res, 'Notifications retrieved', notifications);
    } catch (error) {
      logger.error('[Notification] Error in getUserNotifications:', error);
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
      logger.info('[Notification] Marking notification as read', { id: req.params.id });
      const result = await notificationService.markAsRead(req.params.id);
      return sendSuccess(res, 'Notification marked as read', result);
    } catch (error) {
      logger.error('[Notification] Error in markRead:', error);
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
      logger.info('[Notification] Deleting notification', { id: req.params.id });
      const result = await notificationService.deleteNotification(req.params.id);
      return sendSuccess(res, 'Notification deleted', result);
    } catch (error) {
      logger.error('[Notification] Error in deleteNotification:', error);
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
      logger.info('[Notification] Clearing all notifications', { userId });
      const result = await notificationService.clearAllNotifications(userId);
      return sendSuccess(res, 'All notifications cleared successfully', result);
    } catch (error) {
      logger.error('[Notification] Error in clearAllNotifications:', error);
      next(error);
    }
  },
};

