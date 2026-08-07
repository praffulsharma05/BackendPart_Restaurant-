import { Request, Response, NextFunction } from 'express';
import { rewardService } from '../services/reward.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const rewardController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getRewardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      logger.info('[Reward] Fetching reward summary', { userId });
      const summary = await rewardService.getUserRewardSummary(userId);
      if (!summary) return sendError(res, 'User not found', 404);

      return sendSuccess(res, 'Reward summary retrieved', summary);
    } catch (error) {
      logger.error('[Reward] Error in getRewardSummary:', error);
      next(error);
    }
  },

  async getRewardSettings(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Reward] Fetching reward settings');
      const settings = await rewardService.getRewardSettings();
      return sendSuccess(res, 'Reward settings retrieved successfully', settings);
    } catch (error) {
      logger.error('[Reward] Error in getRewardSettings:', error);
      next(error);
    }
  },

  async updateRewardSettings(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Reward] Updating reward settings');
      const updated = await rewardService.updateRewardSettings(req.body);
      return sendSuccess(res, 'Reward configuration updated successfully', updated);
    } catch (error) {
      logger.error('[Reward] Error in updateRewardSettings:', error);
      next(error);
    }
  },
};

