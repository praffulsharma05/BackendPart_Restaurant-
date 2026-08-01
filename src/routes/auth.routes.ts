import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/admin-login', authController.adminLogin);
router.post('/verify-firebase-token', authController.verifyFirebase);
router.get('/profile', authenticate, authController.getProfile);
router.get('/customers', optionalAuthenticate, authController.getAllCustomers);

export default router;
