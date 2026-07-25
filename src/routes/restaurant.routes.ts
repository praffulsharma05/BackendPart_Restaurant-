import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', restaurantController.getDetails);
router.put('/', authenticate, authorizeRoles(['ADMIN']), restaurantController.updateInfo);

export default router;
