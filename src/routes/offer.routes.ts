import { Router } from 'express';
import { offerController } from '../controllers/offer.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', offerController.getOffers);
router.post('/validate', authenticate, offerController.validateCoupon);
router.post('/', authenticate, authorizeRoles(['ADMIN']), offerController.createOffer);

export default router;
