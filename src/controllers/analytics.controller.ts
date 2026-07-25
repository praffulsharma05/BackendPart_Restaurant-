import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';

export const analyticsController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await analyticsService.getDashboardSummary();
      return sendSuccess(res, 'Analytics dashboard summary retrieved', summary);
    } catch (error) {
      next(error);
    }
  },

  async getTopDishes(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      const dishes = await analyticsService.getMostOrderedDishes(limit);
      return sendSuccess(res, 'Most ordered dishes ranking retrieved', dishes);
    } catch (error) {
      next(error);
    }
  },

  async getPeakHours(req: Request, res: Response, next: NextFunction) {
    try {
      const hours = await analyticsService.getPeakOrderingHours();
      return sendSuccess(res, 'Peak ordering hours data retrieved', hours);
    } catch (error) {
      next(error);
    }
  },

  async getCancelledOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const cancelled = await analyticsService.getCancelledOrdersAnalytics();
      return sendSuccess(res, 'Cancelled orders analytics retrieved', cancelled);
    } catch (error) {
      next(error);
    }
  },
};
