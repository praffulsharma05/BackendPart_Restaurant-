import { Request, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const offerController = {
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await offerService.getActiveOffers();
      return sendSuccess(res, 'Active offers retrieved', offers);
    } catch (error) {
      next(error);
    }
  },

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

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await offerService.createOffer(req.body);
      return sendSuccess(res, 'Offer created successfully', offer, 201);
    } catch (error) {
      next(error);
    }
  },
};
