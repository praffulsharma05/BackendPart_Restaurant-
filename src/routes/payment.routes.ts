import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/payment/config
 * Directly returns confidential admin payment settings
 */
router.get('/config', (req: Request, res: Response) => {
  const upiId = process.env.ADMIN_UPI_ID || 'gourmetgo@upi';
  const merchantName = process.env.ADMIN_MERCHANT_NAME || 'Gourmet Go Fine Dining';

  res.status(200).json({
    upiId,
    merchantName,
  });
});

export default router;
