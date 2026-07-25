import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const authController = {
  async verifyFirebase(req: Request, res: Response, next: NextFunction) {
    try {
      const { firebaseToken, phone } = req.body;
      const result = await authService.verifyFirebaseAndLogin(firebaseToken, phone);
      return sendSuccess(res, 'Authentication successful', result);
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const profile = await authService.getUserProfile(userId);
      if (!profile) return sendError(res, 'User not found', 444);

      return sendSuccess(res, 'User profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  },
};
