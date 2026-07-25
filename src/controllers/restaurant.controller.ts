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
};
