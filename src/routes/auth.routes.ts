import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/admin-login', authController.adminLogin);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/upload-avatar', authenticate, upload.single('avatar'), authController.uploadAvatar);
router.get('/customers', optionalAuthenticate, authController.getAllCustomers);
router.patch('/customers/:id/block', optionalAuthenticate, authController.toggleBlockCustomer);
router.delete('/customers/:id', optionalAuthenticate, authController.deleteCustomer);

export default router;
