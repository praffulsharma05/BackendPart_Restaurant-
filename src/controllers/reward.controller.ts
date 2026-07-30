import { Request, Response, NextFunction } from 'express';
import { rewardService } from '../services/reward.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

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
      const summary = await rewardService.getUserRewardSummary(userId);
      if (!summary) return sendError(res, 'User not found', 404);

      return sendSuccess(res, 'Reward summary retrieved', summary);
    } catch (error) {
      next(error);
    }
  },
};
