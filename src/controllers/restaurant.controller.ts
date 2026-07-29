import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { sendSuccess } from '../utils/apiResponse';

export const restaurantController = {
  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await restaurantService.getRestaurantDetails();
      return sendSuccess(res, 'Restaurant info and timings retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  async updateInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await restaurantService.updateRestaurantInfo(req.body);
      return sendSuccess(res, 'Restaurant info updated successfully', data);
    } catch (error) {
      next(error);
    }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
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
        // Fallback to data URI
      }

      // Automatically update MySQL database with uploaded logoUrl
      await restaurantService.updateRestaurantInfo({ logoUrl: imageUrl });

      return sendSuccess(res, 'Logo uploaded and saved to database successfully', { imageUrl });
    } catch (error) {
      next(error);
    }
  },
};
