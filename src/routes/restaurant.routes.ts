import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', restaurantController.getDetails);
router.put('/', authenticate, authorizeRoles(['ADMIN']), restaurantController.updateInfo);
router.post('/upload-logo', authenticate, authorizeRoles(['ADMIN']), upload.single('logo'), restaurantController.uploadLogo);

export default router;
