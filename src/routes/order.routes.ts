import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, optionalAuthenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', optionalAuthenticate, orderController.createOrder);
router.get('/my-orders', optionalAuthenticate, orderController.getUserOrders);
router.get('/all', authenticate, authorizeRoles(['ADMIN', 'KITCHEN', 'WAITER']), orderController.getAllOrders);
router.get('/:id', optionalAuthenticate, orderController.getOrderById);

router.patch('/:id/status', authenticate, authorizeRoles(['ADMIN', 'KITCHEN', 'WAITER']), orderController.updateStatus);
router.patch('/:id/prep-time', authenticate, authorizeRoles(['ADMIN', 'KITCHEN']), orderController.updatePrepTime);
router.post('/:id/partial-reject', authenticate, authorizeRoles(['ADMIN', 'KITCHEN']), orderController.partialReject);

export default router;
