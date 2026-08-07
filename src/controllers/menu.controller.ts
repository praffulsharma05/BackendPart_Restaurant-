import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { customizationController } from './customization.controller';

export const menuController = {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await menuService.getCategories();
      return sendSuccess(res, 'Menu categories retrieved', categories);
    } catch (error) {
      next(error);
    }
  },

  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, includeHidden, minRating, priceRange, spiceLevel, sortBy } = req.query;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'KITCHEN';
      const showHidden = isAdmin && includeHidden === 'true';

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
      next(error);
    }
  },

  async getMenuItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await menuService.getMenuItemById(req.params.id);
      if (!item) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item retrieved', item);
    } catch (error) {
      next(error);
    }
  },

  async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await menuService.createMenuItem(req.body);
      return sendSuccess(res, 'Menu item created successfully', item, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      return sendSuccess(res, 'Menu item updated successfully', item);
    } catch (error) {
      next(error);
    }
  },

  async updateInventoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!['AVAILABLE', 'SOLD_OUT'].includes(status)) {
        return sendError(res, "Status must be 'AVAILABLE' or 'SOLD_OUT'", 400);
      }
      const item = await menuService.updateInventoryStatus(req.params.id, status);
      return sendSuccess(res, `Dish inventory status updated to '${status}'`, item);
    } catch (error) {
      next(error);
    }
  },

  async toggleHide(req: Request, res: Response, next: NextFunction) {
    try {
      const { isHidden } = req.body;
      const item = await menuService.toggleHideMenuItem(req.params.id, Boolean(isHidden));
      return sendSuccess(res, `Menu item visibility updated to ${isHidden ? 'Hidden' : 'Visible'}`, item);
    } catch (error) {
      next(error);
    }
  },

  async getArchivedMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await menuService.getArchivedMenuItems();
      return sendSuccess(res, 'Archived menu items retrieved successfully', items);
    } catch (error) {
      next(error);
    }
  },

  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await menuService.deleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Menu item not found', 404);
      return sendSuccess(res, 'Menu item archived successfully');
    } catch (error) {
      next(error);
    }
  },

  async restoreMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const restored = await menuService.restoreMenuItem(req.params.id);
      if (!restored) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item restored successfully');
    } catch (error) {
      next(error);
    }
  },

  async permanentDeleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await menuService.permanentDeleteMenuItem(req.params.id);
      if (!deleted) return sendError(res, 'Archived menu item not found', 404);
      return sendSuccess(res, 'Menu item permanently deleted');
    } catch (error) {
      next(error);
    }
  },

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
        // Fallback
      }

      return sendSuccess(res, 'Image uploaded successfully', { imageUrl });
    } catch (error) {
      next(error);
    }
  },

  getCustomizations: customizationController.getCustomizations,
  addCustomization: customizationController.addCustomization,
  updateCustomization: customizationController.updateCustomization,
  deleteCustomization: customizationController.deleteCustomization,
  getMasterCustomizations: customizationController.getMasterCustomizations,
  addMasterCustomization: customizationController.addMasterCustomization,
  updateMasterCustomization: customizationController.updateMasterCustomization,
  deleteMasterCustomization: customizationController.deleteMasterCustomization,
};
