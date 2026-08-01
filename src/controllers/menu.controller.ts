import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const menuController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await menuService.getCategories();
      return sendSuccess(res, 'Menu categories retrieved', categories);
    } catch (error) {
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
      const { category, search, includeHidden } = req.query;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'KITCHEN';
      const showHidden = isAdmin && includeHidden === 'true';

      const items = await menuService.getAllMenuItems(showHidden, category as string, search as string);
      return sendSuccess(res, 'Menu items retrieved successfully', items);
    } catch (error) {
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
      const item = await menuService.getMenuItemById(req.params.id);
      if (!item) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item retrieved', item);
    } catch (error) {
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
      const item = await menuService.createMenuItem(req.body);
      return sendSuccess(res, 'Menu item created successfully', item, 201);
    } catch (error) {
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
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      return sendSuccess(res, 'Menu item updated successfully', item);
    } catch (error) {
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
      if (!['AVAILABLE', 'SOLD_OUT'].includes(status)) {
        return sendError(res, "Status must be 'AVAILABLE' or 'SOLD_OUT'", 400);
      }
      const item = await menuService.updateInventoryStatus(req.params.id, status);
      return sendSuccess(res, `Dish inventory status updated to '${status}'`, item);
    } catch (error) {
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
      const item = await menuService.toggleHideMenuItem(req.params.id, Boolean(isHidden));
      return sendSuccess(res, `Menu item visibility updated to ${isHidden ? 'Hidden' : 'Visible'}`, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all archived menu items
   */
  async getArchivedMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await menuService.getArchivedMenuItems();
      return sendSuccess(res, 'Archived menu items retrieved successfully', items);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soft delete a menu item (moves to archive)
   */
  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await menuService.deleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item archived successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Restore an archived menu item
   */
  async restoreMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const restored = await menuService.restoreMenuItem(req.params.id);
      if (!restored) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item restored successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Permanently delete an archived menu item
   */
  async permanentDeleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await menuService.permanentDeleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item permanently deleted');
    } catch (error) {
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
      if (!req.file) {
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
        // Fallback to base64 data URI
      }

      return sendSuccess(res, 'Image uploaded successfully', { imageUrl });
    } catch (error) {
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
      const options = await menuService.getCustomizationsByMenuItemId(req.params.id);
      return sendSuccess(res, 'Customizations retrieved successfully', options);
    } catch (error) {
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
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await menuService.addCustomizationOption(req.params.id, { name, price: Number(price) });
      return sendSuccess(res, 'Customization added successfully', option, 201);
    } catch (error) {
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
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await menuService.updateCustomizationOption(req.params.id, req.params.customizationId, { name, price: Number(price) });
      return sendSuccess(res, 'Customization updated successfully', option);
    } catch (error) {
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
      const deleted = await menuService.deleteCustomizationOption(req.params.id, req.params.customizationId);
      if (!deleted) return sendError(res, 'Customization not found', 404);
      return sendSuccess(res, 'Customization deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
