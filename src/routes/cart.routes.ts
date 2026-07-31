import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(optionalAuthenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/checkout', cartController.checkout);
router.put('/update', cartController.updateQuantity);
router.delete('/clear', cartController.clearCart);
router.delete('/:menuItemId', cartController.removeItem);

export default router;
