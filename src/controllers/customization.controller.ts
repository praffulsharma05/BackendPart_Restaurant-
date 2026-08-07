import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const customizationController = {
  async getCustomizations(req: Request, res: Response, next: NextFunction) {
    try {
      const options = await menuService.getCustomizationsByMenuItemId(req.params.id);
      return sendSuccess(res, 'Customizations retrieved successfully', options);
    } catch (error) {
      next(error);
    }
  },

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

  async deleteCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await menuService.deleteCustomizationOption(req.params.id, req.params.customizationId);
      if (!deleted) return sendError(res, 'Customization not found', 404);
      return sendSuccess(res, 'Customization deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMasterCustomizations(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await (menuService as any).getMasterCustomizations();
      return sendSuccess(res, 'Master customizations retrieved successfully', list);
    } catch (error) {
      next(error);
    }
  },

  async addMasterCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price } = req.body;
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await (menuService as any).addMasterCustomization(name, Number(price));
      return sendSuccess(res, 'Master customization added successfully', option, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateMasterCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price } = req.body;
      if (!name || price === undefined) {
        return sendError(res, 'Name and price are required', 400);
      }
      const option = await (menuService as any).updateMasterCustomization(req.params.id, name, Number(price));
      return sendSuccess(res, 'Master customization updated successfully', option);
    } catch (error) {
      next(error);
    }
  },

  async deleteMasterCustomization(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await (menuService as any).deleteMasterCustomization(req.params.id);
      if (!deleted) return sendError(res, 'Master customization not found', 404);
      return sendSuccess(res, 'Master customization deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
