import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/categories', menuController.getCategories);
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Cloudinary image upload endpoint
router.post('/upload-image', authenticate, authorizeRoles(['ADMIN']), upload.single('image'), menuController.uploadImage);

// Menu item management endpoints
router.post('/', authenticate, authorizeRoles(['ADMIN']), menuController.createMenuItem);
router.put('/:id', authenticate, authorizeRoles(['ADMIN']), menuController.updateMenuItem);
router.patch('/:id/inventory-status', authenticate, authorizeRoles(['ADMIN', 'KITCHEN']), menuController.updateInventoryStatus);
router.patch('/:id/hide', authenticate, authorizeRoles(['ADMIN']), menuController.toggleHide);
router.delete('/:id', authenticate, authorizeRoles(['ADMIN']), menuController.deleteMenuItem);

export default router;
