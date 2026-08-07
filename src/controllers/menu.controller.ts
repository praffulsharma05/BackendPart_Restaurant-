import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const menuController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Fetching categories');
      const categories = await menuService.getCategories();
      return sendSuccess(res, 'Menu categories retrieved', categories);
    } catch (error) {
      logger.error('[Menu] Error in getCategories:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, includeHidden, minRating, priceRange, spiceLevel, sortBy } = req.query;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'KITCHEN';
      const showHidden = isAdmin && includeHidden === 'true';
      logger.info('[Menu] Fetching menu items', { category, search, showHidden });

      const items = await menuService.getAllMenuItems(
        showHidden,
        category as string,
        search as string,
        {
          minRating: minRating ? Number(minRating) : undefined,
          priceRange: priceRange as string,
          spiceLevel: spiceLevel as string,
          sortBy: sortBy as string,
        }
      );
      return sendSuccess(res, 'Menu items retrieved successfully', items);
    } catch (error) {
      logger.error('[Menu] Error in getMenuItems:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getMenuItemById(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Fetching menu item by ID', { id: req.params.id });
      const item = await menuService.getMenuItemById(req.params.id);
      if (!item) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item retrieved', item);
    } catch (error) {
      logger.error('[Menu] Error in getMenuItemById:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Creating menu item', { name: req.body.name });
      const item = await menuService.createMenuItem(req.body);
      return sendSuccess(res, 'Menu item created successfully', item, 201);
    } catch (error) {
      logger.error('[Menu] Error in createMenuItem:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Updating menu item', { id: req.params.id });
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      return sendSuccess(res, 'Menu item updated successfully', item);
    } catch (error) {
      logger.error('[Menu] Error in updateMenuItem:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateInventoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body; // 'AVAILABLE' | 'SOLD_OUT'
      logger.info('[Menu] Updating inventory status', { id: req.params.id, status });
      if (!['AVAILABLE', 'SOLD_OUT'].includes(status)) {
        logger.warn('[Menu] Invalid inventory status', { status });
        return sendError(res, "Status must be 'AVAILABLE' or 'SOLD_OUT'", 400);
      }
      const item = await menuService.updateInventoryStatus(req.params.id, status);
      return sendSuccess(res, `Dish inventory status updated to '${status}'`, item);
    } catch (error) {
      logger.error('[Menu] Error in updateInventoryStatus:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async toggleHide(req: Request, res: Response, next: NextFunction) {
    try {
      const { isHidden } = req.body;
      logger.info('[Menu] Toggling hide menu item', { id: req.params.id, isHidden });
      const item = await menuService.toggleHideMenuItem(req.params.id, Boolean(isHidden));
      return sendSuccess(res, `Menu item visibility updated to ${isHidden ? 'Hidden' : 'Visible'}`, item);
    } catch (error) {
      logger.error('[Menu] Error in toggleHide:', error);
      next(error);
    }
  },

  /**
   * Get all archived menu items
   */
  async getArchivedMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Fetching archived menu items');
      const items = await menuService.getArchivedMenuItems();
      return sendSuccess(res, 'Archived menu items retrieved successfully', items);
    } catch (error) {
      logger.error('[Menu] Error in getArchivedMenuItems:', error);
      next(error);
    }
  },

  /**
   * Soft delete a menu item (moves to archive)
   */
  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Archiving menu item', { id: req.params.id });
      const deleted = await menuService.deleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item archived successfully');
    } catch (error) {
      logger.error('[Menu] Error in deleteMenuItem:', error);
      next(error);
    }
  },

  /**
   * Restore an archived menu item
   */
  async restoreMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Restoring menu item', { id: req.params.id });
      const restored = await menuService.restoreMenuItem(req.params.id);
      if (!restored) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item restored successfully');
    } catch (error) {
      logger.error('[Menu] Error in restoreMenuItem:', error);
      next(error);
    }
  },

  /**
   * Permanently delete an archived menu item
   */
  async permanentDeleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Permanently deleting menu item', { id: req.params.id });
      const deleted = await menuService.permanentDeleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item permanently deleted');
    } catch (error) {
      logger.error('[Menu] Error in permanentDeleteMenuItem:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Uploading dish image');
      if (!req.file) {
        logger.warn('[Menu] Dish image upload failed: No image file provided');
        return sendError(res, 'No image file uploaded', 400);
      }

      const mime = req.file.mimetype || 'image/png';
      const base64 = req.file.buffer.toString('base64');
      let imageUrl = `data:${mime};base64,${base64}`;

      try {
        const cloudUrl = await uploadToCloudinary(req.file.buffer, 'restaurant_menu');
        if (cloudUrl && !cloudUrl.includes('unsplash')) {
          imageUrl = cloudUrl;
        }
      } catch (err) {
        logger.warn('[Menu] Cloudinary image upload failed, falling back to base64');
      }

      return sendSuccess(res, 'Image uploaded successfully', { imageUrl });
    } catch (error) {
      logger.error('[Menu] Error in uploadImage:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getCustomizations(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Fetching customizations', { id: req.params.id });
      const options = await menuService.getCustomizationsByMenuItemId(req.params.id);
      return sendSuccess(res, 'Customizations retrieved successfully', options);
    } catch (error) {
      logger.error('[Menu] Error in getCustomizations:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async addCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price } = req.body;
      logger.info('[Menu] Adding customization', { id: req.params.id, name, price });
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await menuService.addCustomizationOption(req.params.id, { name, price: Number(price) });
      return sendSuccess(res, 'Customization added successfully', option, 201);
    } catch (error) {
      logger.error('[Menu] Error in addCustomization:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price } = req.body;
      logger.info('[Menu] Updating customization', { id: req.params.id, customizationId: req.params.customizationId, name, price });
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await menuService.updateCustomizationOption(req.params.id, req.params.customizationId, { name, price: Number(price) });
      return sendSuccess(res, 'Customization updated successfully', option);
    } catch (error) {
      logger.error('[Menu] Error in updateCustomization:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async deleteCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Menu] Deleting customization', { id: req.params.id, customizationId: req.params.customizationId });
      const deleted = await menuService.deleteCustomizationOption(req.params.id, req.params.customizationId);
      if (!deleted) return sendError(res, 'Customization not found', 404);
      return sendSuccess(res, 'Customization deleted successfully');
    } catch (error) {
      logger.error('[Menu] Error in deleteCustomization:', error);
      next(error);
    }
  },
};

