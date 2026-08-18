import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate, optionalAuthenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuthenticate, notificationController.getUserNotifications);
router.get('/:id/acknowledge', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), notificationController.acknowledgeNotification);
router.patch('/:id/acknowledge', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), notificationController.acknowledgeNotification);
router.post('/:id/acknowledge', authenticate, authorizeRoles(['ADMIN', 'WAITER', 'KITCHEN']), notificationController.acknowledgeNotification);
router.patch('/:id/read', optionalAuthenticate, notificationController.markRead);
router.delete('/clear-all', optionalAuthenticate, notificationController.clearAllNotifications);
router.delete('/:id', optionalAuthenticate, notificationController.deleteNotification);
router.delete('/', optionalAuthenticate, notificationController.clearAllNotifications);

export default router;
