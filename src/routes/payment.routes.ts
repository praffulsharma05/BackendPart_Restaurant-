import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * GET /api/payment/config
 */
router.get('/config', paymentController.getPaymentConfig);

/**
 * POST /api/payment/upload-receipt
 */
router.post('/upload-receipt', upload.any(), paymentController.uploadReceipt);

export default router;
