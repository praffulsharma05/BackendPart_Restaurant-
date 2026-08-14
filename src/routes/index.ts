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
import superadminRoutes from './superadmin.routes';
import cartRoutes from './cart.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Restaurant Scalable REST API Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/menu', menuRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/rewards', rewardRoutes);
router.use('/waiter', waiterRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payment', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
