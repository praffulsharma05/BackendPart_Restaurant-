import { Request, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

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
      const offers = await offerService.getActiveOffers(all === 'true');
      return sendSuccess(res, 'Offers retrieved successfully', offers);
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
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const userId = req.user?.id || 'u101';
      const result = await offerService.validateCouponCode(code, Number(subtotal), userId);

      if (!result.valid) {
        return sendError(res, result.message || 'Invalid coupon', 400);
      }
      return sendSuccess(res, 'Coupon valid', result);
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
  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await offerService.createOffer(req.body);
      return sendSuccess(res, 'Offer created successfully', offer, 201);
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
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return sendError(res, 'isActive must be a boolean', 400);
      }
      const result = await offerService.toggleStatus(req.params.id, isActive);
      return sendSuccess(res, `Offer status updated`, result);
    } catch (error) {
      next(error);
    }
  },
};
