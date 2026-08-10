import { Request, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const offerController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const { all } = req.query;
      logger.info('[Offer] Fetching offers', { all });
      const offers = await offerService.getActiveOffers(all === 'true');
      return sendSuccess(res, 'Offers retrieved successfully', offers);
    } catch (error) {
      logger.error('[Offer] Error in getOffers:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const userId = req.user?.id || 'u101';
      logger.info('[Offer] Validating coupon', { code, subtotal, userId });
      const result = await offerService.validateCouponCode(code, Number(subtotal), userId);

      if (!result.valid) {
        logger.warn('[Offer] Coupon validation failed', { code, reason: result.message });
        return sendError(res, result.message || 'Invalid coupon', 400);
      }
      return sendSuccess(res, 'Coupon valid', result);
    } catch (error) {
      logger.error('[Offer] Error in validateCoupon:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Offer] Creating new offer', { code: req.body?.code, title: req.body?.title });
      const offer = await offerService.createOffer(req.body);
      return sendSuccess(res, 'Offer created successfully', offer, 201);
    } catch (error) {
      logger.error('[Offer] Error in createOffer:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      logger.info('[Offer] Toggling offer status', { id: req.params.id, isActive });
      if (typeof isActive !== 'boolean') {
        logger.warn('[Offer] Toggle status failed: isActive must be boolean');
        return sendError(res, 'isActive must be a boolean', 400);
      }
      const result = await offerService.toggleStatus(req.params.id, isActive);
      return sendSuccess(res, `Offer status updated`, result);
    } catch (error) {
      logger.error('[Offer] Error in toggleStatus:', error);
      next(error);
    }
  },

  async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Offer] Deleting offer', { id: req.params.id });
      await offerService.deleteOffer(req.params.id);
      return sendSuccess(res, 'Offer deleted successfully');
    } catch (error) {
      logger.error('[Offer] Error in deleteOffer:', error);
      next(error);
    }
  },
};

