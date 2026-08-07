import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const restaurantController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Fetching restaurant details');
      const data = await restaurantService.getRestaurantDetails();
      return sendSuccess(res, 'Restaurant info and timings retrieved', data);
    } catch (error) {
      logger.error('[Restaurant] Error in getDetails:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateInfo(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Updating restaurant info');
      const data = await restaurantService.updateRestaurantInfo(req.body);
      return sendSuccess(res, 'Restaurant info updated successfully', data);
    } catch (error) {
      logger.error('[Restaurant] Error in updateInfo:', error);
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
      logger.info('[Restaurant] Uploading restaurant logo');
      if (!req.file) {
        logger.warn('[Restaurant] Logo upload failed: No logo file uploaded');
        return res.status(400).json({ success: false, message: 'No logo file uploaded' });
      }

      const mime = req.file.mimetype || 'image/png';
      const base64 = req.file.buffer.toString('base64');
      let imageUrl = `data:${mime};base64,${base64}`;

      // Try uploading to Cloudinary if available
      try {
        const { uploadToCloudinary } = await import('../config/cloudinary');
        const cloudUrl = await uploadToCloudinary(req.file.buffer, 'restaurant_logos');
        if (cloudUrl && !cloudUrl.includes('unsplash')) {
          imageUrl = cloudUrl;
        }
      } catch (err) {
        logger.warn('[Restaurant] Cloudinary logo upload failed, falling back to base64');
      }

      // Automatically update MySQL database with uploaded logoUrl
      await restaurantService.updateRestaurantInfo({ logoUrl: imageUrl });

      return sendSuccess(res, 'Logo uploaded and saved to database successfully', { imageUrl });
    } catch (error) {
      logger.error('[Restaurant] Error in uploadLogo:', error);
      next(error);
    }
  },

  getTables(req: Request, res: Response) {
    logger.info('[Restaurant] Fetching tables');
    const tables = Array.from({ length: 30 }, (_, i) => ({
      id: `t${i + 1}`,
      tableNumber: `Table ${i + 1}`,
      status: 'Available',
    }));
    return res.json({ success: true, data: tables });
  },
};

