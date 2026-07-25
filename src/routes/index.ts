import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import offerRoutes from './offer.routes';
import rewardRoutes from './reward.routes';
import waiterRoutes from './waiter.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/rewards', rewardRoutes);
router.use('/waiter', waiterRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payment', paymentRoutes);

export default router;
