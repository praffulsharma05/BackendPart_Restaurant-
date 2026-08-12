import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuthenticate, notificationController.getUserNotifications);
router.get('/:id/acknowledge', optionalAuthenticate, notificationController.acknowledgeNotification);
router.patch('/:id/acknowledge', optionalAuthenticate, notificationController.acknowledgeNotification);
router.post('/:id/acknowledge', optionalAuthenticate, notificationController.acknowledgeNotification);
router.patch('/:id/read', optionalAuthenticate, notificationController.markRead);
router.delete('/clear-all', optionalAuthenticate, notificationController.clearAllNotifications);
router.delete('/:id', optionalAuthenticate, notificationController.deleteNotification);
router.delete('/', optionalAuthenticate, notificationController.clearAllNotifications);

export default router;
