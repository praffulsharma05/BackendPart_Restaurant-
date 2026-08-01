import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuthenticate, notificationController.getUserNotifications);
router.patch('/:id/read', authenticate, notificationController.markRead);
router.delete('/:id', optionalAuthenticate, notificationController.deleteNotification);

export default router;
