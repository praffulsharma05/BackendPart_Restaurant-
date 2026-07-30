import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const authController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }
      const result = await authService.adminLogin(email, password);
      return sendSuccess(res, 'Admin login successful', result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return sendError(res, 'Invalid email or password', 401);
      }
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async verifyFirebase(req: Request, res: Response, next: NextFunction) {
    try {
      const { firebaseToken, phone, password } = req.body;
      const result = await authService.verifyFirebaseAndLogin(firebaseToken, phone, password);
      return sendSuccess(res, 'Authentication successful', result);
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
