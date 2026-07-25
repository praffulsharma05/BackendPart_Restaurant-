import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Owner / Admin Dashboard Analytics APIs
router.get('/summary', authenticate, authorizeRoles(['ADMIN']), analyticsController.getSummary);
router.get('/top-dishes', authenticate, authorizeRoles(['ADMIN']), analyticsController.getTopDishes);
router.get('/peak-hours', authenticate, authorizeRoles(['ADMIN']), analyticsController.getPeakHours);
router.get('/cancelled-orders', authenticate, authorizeRoles(['ADMIN']), analyticsController.getCancelledOrders);

export default router;
