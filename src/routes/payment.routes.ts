import { Router, Request, Response } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { upload } from '../middlewares/upload.middleware';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

/**
 * GET /api/payment/config
 * Reads payment credentials dynamically from environment variables & database
 */
router.get('/config', async (req: Request, res: Response) => {
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
});

/**
 * POST /api/payment/upload-receipt
 * Upload payment proof receipt screenshot to Cloudinary
 */
router.post('/upload-receipt', upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'No screenshot file uploaded', 400);
    }
    const cloudUrl = await uploadToCloudinary(req.file.buffer, 'payment_screenshots');
    return sendSuccess(res, 'Receipt screenshot uploaded successfully', { url: cloudUrl });
  } catch (error: any) {
    console.error('Receipt Upload Error:', error);
    return sendError(res, error.message || 'Failed to upload receipt screenshot', 500);
  }
});

export default router;
