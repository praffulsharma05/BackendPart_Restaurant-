import { Router } from 'express';
import { waiterController } from '../controllers/waiter.controller';
import { authenticate, optionalAuthenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/call', waiterController.callWaiter);
router.get('/pending', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), waiterController.getPending);
router.get('/:id/attend', optionalAuthenticate, waiterController.attendCall);
router.patch('/:id/attend', optionalAuthenticate, waiterController.attendCall);
router.post('/:id/attend', optionalAuthenticate, waiterController.attendCall);

export default router;
