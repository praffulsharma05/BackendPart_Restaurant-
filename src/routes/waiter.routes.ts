import { Router } from 'express';
import { waiterController } from '../controllers/waiter.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/call', waiterController.callWaiter);
router.get('/pending', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), waiterController.getPending);
router.patch('/:id/attend', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), waiterController.attendCall);
router.post('/:id/attend', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), waiterController.attendCall);

export default router;
