import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { sendSuccess } from '../utils/apiResponse';
import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const superAdminController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      const activeCount = restaurants.filter((r) => r.isActive).length;

      let totalOrdersPlatform = 0;
      let totalPlatformRevenue = 0;

      try {
        const [orderStats] = await dbPool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders'
        );
        if (orderStats.length > 0) {
          totalOrdersPlatform = Number(orderStats[0].count || 0);
          totalPlatformRevenue = Number(orderStats[0].revenue || 0);
        }
      } catch (_e) {
        // Fall back to 0 platform stats if table empty
      }

      return sendSuccess(res, 'Super Admin statistics retrieved', {
        totalRestaurants: restaurants.length,
        activeRestaurants: activeCount,
        inactiveRestaurants: restaurants.length - activeCount,
        totalOrdersPlatform,
        totalPlatformRevenue,
        restaurants,
      });
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
  async getRestaurants(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await restaurantService.getAllRestaurants();
      return sendSuccess(res, 'Restaurants list retrieved', list);
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
  async createRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await restaurantService.createRestaurant(req.body);
      return sendSuccess(res, 'New restaurant created successfully', data);
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
  async updateRestaurantBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await restaurantService.updateRestaurantBranding(id, req.body);
      return sendSuccess(res, 'Restaurant branding updated successfully', data);
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
  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No logo file uploaded' });
      }

      const mime = req.file.mimetype || 'image/png';
      const base64 = req.file.buffer.toString('base64');
      let imageUrl = `data:${mime};base64,${base64}`;

      try {
        const { uploadToCloudinary } = await import('../config/cloudinary');
        const cloudUrl = await uploadToCloudinary(req.file.buffer, 'restaurant_logos');
        if (cloudUrl && !cloudUrl.includes('unsplash')) {
          imageUrl = cloudUrl;
        }
      } catch (err) {
        // Fallback to data URI
      }

      const { id } = req.params;
      if (id) {
        await restaurantService.updateRestaurantBranding(id, { logoUrl: imageUrl });
      } else {
        await restaurantService.updateRestaurantInfo({ logoUrl: imageUrl });
      }

      return sendSuccess(res, 'Logo uploaded and synced to database successfully', { imageUrl });
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
  async setActiveRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await restaurantService.setRestaurantActive(id);
      return sendSuccess(res, 'Active restaurant switched successfully', data);
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
  async deleteRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await restaurantService.deleteRestaurant(id);
      return sendSuccess(res, 'Restaurant removed', result);
    } catch (error) {
      next(error);
    }
  }
};
