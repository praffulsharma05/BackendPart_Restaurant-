import { Request, Response } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { PAYMENT_STRINGS } from '../constants/payment.constants';

export const paymentController = {
  /**
   * GET /api/payment/config
   * Reads payment credentials dynamically from environment variables & database
   */
  async getPaymentConfig(req: Request, res: Response) {
    try {
      const details = await restaurantService.getRestaurantDetails();
      const upiId = process.env.ADMIN_UPI_ID || details.info.qrDetails.upiId || '';
      const merchantName = process.env.ADMIN_MERCHANT_NAME || details.info.name || '';

      res.status(200).json({
        upiId,
        merchantName,
      });
    } catch (_e) {
      res.status(200).json({
        upiId: process.env.ADMIN_UPI_ID || '',
        merchantName: process.env.ADMIN_MERCHANT_NAME || '',
      });
    }
  },

  /**
   * POST /api/payment/upload-receipt
   * Upload payment proof receipt screenshot to Cloudinary
   */
  async uploadReceipt(req: Request, res: Response) {
    try {
      const file = req.file || (req.files && (req.files as Express.Multer.File[])[0]);
      if (!file) {
        return sendError(res, PAYMENT_STRINGS.ERRORS.NO_FILE, 400);
      }
      const cloudUrl = await uploadToCloudinary(file.buffer, PAYMENT_STRINGS.CLOUDINARY_FOLDER);
      return sendSuccess(res, PAYMENT_STRINGS.MESSAGES.UPLOAD_SUCCESS, { url: cloudUrl });
    } catch (error: any) {
      console.error('Receipt Upload Error:', error);
      return sendError(res, error.message || PAYMENT_STRINGS.ERRORS.UPLOAD_FAILED, 500);
    }
  },
};
