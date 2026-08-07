import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const analyticsController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Analytics] Fetching dashboard summary');
      const summary = await analyticsService.getDashboardSummary();
      return sendSuccess(res, 'Analytics dashboard summary retrieved', summary);
    } catch (error) {
      logger.error('[Analytics] Error in getSummary:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getTopDishes(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      logger.info('[Analytics] Fetching top dishes', { limit });
      const dishes = await analyticsService.getMostOrderedDishes(limit);
      return sendSuccess(res, 'Most ordered dishes ranking retrieved', dishes);
    } catch (error) {
      logger.error('[Analytics] Error in getTopDishes:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getPeakHours(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Analytics] Fetching peak hours');
      const hours = await analyticsService.getPeakOrderingHours();
      return sendSuccess(res, 'Peak ordering hours data retrieved', hours);
    } catch (error) {
      logger.error('[Analytics] Error in getPeakHours:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getCancelledOrders(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Analytics] Fetching cancelled orders analytics');
      const cancelled = await analyticsService.getCancelledOrdersAnalytics();
      return sendSuccess(res, 'Cancelled orders analytics retrieved', cancelled);
    } catch (error) {
      logger.error('[Analytics] Error in getCancelledOrders:', error);
      next(error);
    }
  },
};

