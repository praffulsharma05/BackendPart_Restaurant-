import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.get('/all', authenticate, authorizeRoles(['ADMIN', 'KITCHEN', 'WAITER']), orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Owner / Kitchen endpoints
router.patch('/:id/status', authenticate, authorizeRoles(['ADMIN', 'KITCHEN', 'WAITER']), orderController.updateStatus);
router.patch('/:id/prep-time', authenticate, authorizeRoles(['ADMIN', 'KITCHEN']), orderController.updatePrepTime);

export default router;
