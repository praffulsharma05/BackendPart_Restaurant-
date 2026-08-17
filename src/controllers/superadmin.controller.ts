import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { saveLocalFile } from '../utils/localStorage';
import { sendSuccess } from '../utils/apiResponse';
import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { logger } from '../utils/logger';

export const superAdminController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[SuperAdmin] Fetching dashboard stats');
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
        logger.warn('[SuperAdmin] Platform order stats query failed, falling back to 0');
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
      logger.error('[SuperAdmin] Error in getDashboardStats:', error);
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
      logger.info('[SuperAdmin] Fetching all restaurants');
      const list = await restaurantService.getAllRestaurants();
      return sendSuccess(res, 'Restaurants list retrieved', list);
    } catch (error) {
      logger.error('[SuperAdmin] Error in getRestaurants:', error);
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
      logger.info('[SuperAdmin] Creating new restaurant', { name: req.body?.name });
      const data = await restaurantService.createRestaurant(req.body);
      return sendSuccess(res, 'New restaurant created successfully', data);
    } catch (error) {
      logger.error('[SuperAdmin] Error in createRestaurant:', error);
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
      logger.info('[SuperAdmin] Updating restaurant branding', { id });
      const data = await restaurantService.updateRestaurantBranding(id, req.body);
      return sendSuccess(res, 'Restaurant branding updated successfully', data);
    } catch (error) {
      logger.error('[SuperAdmin] Error in updateRestaurantBranding:', error);
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
      const { id } = req.params;
      logger.info('[SuperAdmin] Uploading restaurant logo', { restaurantId: id });
      if (!req.file) {
        logger.warn('[SuperAdmin] Logo upload failed: No file uploaded');
        return res.status(400).json({ success: false, message: 'No logo file uploaded' });
      }

      const imageUrl = saveLocalFile(req.file.buffer, req.file.originalname, 'restaurant_logos');

      if (id) {
        await restaurantService.updateRestaurantBranding(id, { logoUrl: imageUrl });
      } else {
        await restaurantService.updateRestaurantInfo({ logoUrl: imageUrl });
      }

      return sendSuccess(res, 'Logo uploaded and synced to database successfully', { imageUrl });
    } catch (error) {
      logger.error('[SuperAdmin] Error in uploadLogo:', error);
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
      logger.info('[SuperAdmin] Setting active restaurant', { id });
      const data = await restaurantService.setRestaurantActive(id);
      return sendSuccess(res, 'Active restaurant switched successfully', data);
    } catch (error) {
      logger.error('[SuperAdmin] Error in setActiveRestaurant:', error);
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
      logger.info('[SuperAdmin] Deleting restaurant', { id });
      const result = await restaurantService.deleteRestaurant(id);
      return sendSuccess(res, 'Restaurant removed', result);
    } catch (error) {
      logger.error('[SuperAdmin] Error in deleteRestaurant:', error);
      next(error);
    }
  }
};

