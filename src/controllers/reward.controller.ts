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

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      logger.info('[Reward] Fetching reward transactions', { userId });
      const summary = await rewardService.getUserRewardSummary(userId);
      return sendSuccess(res, 'Reward transactions retrieved', summary?.history || []);
    } catch (error) {
      logger.error('[Reward] Error in getTransactions:', error);
      next(error);
    }
  },

  async getVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Reward] Fetching reward vouchers');
      const vouchers = await rewardService.getVouchers();
      return sendSuccess(res, 'Reward vouchers retrieved', vouchers);
    } catch (error) {
      logger.error('[Reward] Error in getVouchers:', error);
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

  async redeemVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      const { voucherId } = req.body;
      logger.info('[Reward] Redeeming voucher', { userId, voucherId });
      if (!voucherId) {
        logger.warn('[Reward] Voucher redeem failed: Missing voucherId');
        return sendError(res, 'Voucher ID is required', 400);
      }
      const result = await rewardService.redeemVoucher(userId, voucherId);
      logger.info('[Reward] Voucher redeemed successfully', { userId, voucherId });
      return sendSuccess(res, 'Voucher redeemed successfully', result);
    } catch (error: any) {
      logger.error('[Reward] Error in redeemVoucher:', error);
      if (error.message === 'Not enough reward points' || error.message === 'Voucher not found') {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  },
};

