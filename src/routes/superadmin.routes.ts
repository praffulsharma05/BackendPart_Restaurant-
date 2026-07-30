import { Router } from 'express';
import { superAdminController } from '../controllers/superadmin.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/stats', superAdminController.getDashboardStats);
router.get('/restaurants', superAdminController.getRestaurants);
router.post('/restaurants', superAdminController.createRestaurant);
router.put('/restaurants/:id', superAdminController.updateRestaurantBranding);
router.post('/restaurants/:id/upload-logo', upload.single('logo'), superAdminController.uploadLogo);
router.post('/upload-logo', upload.single('logo'), superAdminController.uploadLogo);
router.post('/restaurants/:id/activate', superAdminController.setActiveRestaurant);
router.delete('/restaurants/:id', superAdminController.deleteRestaurant);

export default router;
