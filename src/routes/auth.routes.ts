import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/verify-firebase-token', authController.verifyFirebase);
router.get('/profile', authenticate, authController.getProfile);

export default router;
