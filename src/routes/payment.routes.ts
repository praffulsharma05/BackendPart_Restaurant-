import { Router, Request, Response } from 'express';
import { restaurantService } from '../services/restaurant.service';

const router = Router();

/**
 * GET /api/payment/config
 * Directly returns confidential admin payment settings from dynamic DB
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const details = await restaurantService.getRestaurantDetails();
    const upiId = details.info.qrDetails.upiId || process.env.ADMIN_UPI_ID || 'gourmetgo@upi';
    const merchantName = details.info.name || process.env.ADMIN_MERCHANT_NAME || 'Gourmet Go Fine Dining';

    res.status(200).json({
      upiId,
      merchantName,
    });
  } catch (_e) {
    res.status(200).json({
      upiId: process.env.ADMIN_UPI_ID || 'gourmetgo@upi',
      merchantName: process.env.ADMIN_MERCHANT_NAME || 'Gourmet Go Fine Dining',
    });
  }
});

export default router;
