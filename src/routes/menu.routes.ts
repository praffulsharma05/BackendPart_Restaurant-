import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/categories', menuController.getCategories);
router.get('/archived', authenticate, authorizeRoles(['ADMIN']), menuController.getArchivedMenuItems);
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Cloudinary image upload endpoint
router.post('/upload-image', authenticate, authorizeRoles(['ADMIN']), upload.single('image'), menuController.uploadImage);

// Menu item management endpoints
router.post('/', authenticate, authorizeRoles(['ADMIN']), menuController.createMenuItem);
router.put('/:id', authenticate, authorizeRoles(['ADMIN']), menuController.updateMenuItem);
router.patch('/:id/inventory-status', authenticate, authorizeRoles(['ADMIN', 'KITCHEN']), menuController.updateInventoryStatus);
router.patch('/:id/hide', authenticate, authorizeRoles(['ADMIN']), menuController.toggleHide);
router.patch('/:id/restore', authenticate, authorizeRoles(['ADMIN']), menuController.restoreMenuItem);
router.delete('/:id/permanent', authenticate, authorizeRoles(['ADMIN']), menuController.permanentDeleteMenuItem);
router.delete('/:id', authenticate, authorizeRoles(['ADMIN']), menuController.deleteMenuItem);

// Customizations endpoints
router.get('/:id/customizations', menuController.getCustomizations);
router.post('/:id/customizations', authenticate, authorizeRoles(['ADMIN']), menuController.addCustomization);
router.put('/:id/customizations/:customizationId', authenticate, authorizeRoles(['ADMIN']), menuController.updateCustomization);
router.delete('/:id/customizations/:customizationId', authenticate, authorizeRoles(['ADMIN']), menuController.deleteCustomization);

export default router;
