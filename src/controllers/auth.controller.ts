import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { uploadToCloudinary } from '../config/cloudinary';
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
   * Unified login — accepts phone OR email+password
   * @param req
   * @param res
   * @param next
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, email, password, name } = req.body;

      // Phone-based login (auto-register)
      if (phone) {
        const result = await authService.loginWithPhone(phone, name);
        return sendSuccess(res, 'Login successful', result);
      }

      // Email-based login
      if (email && password) {
        const result = await authService.loginWithEmail(email, password);
        return sendSuccess(res, 'Login successful', result);
      }

      return sendError(res, 'Please provide phone number or email with password', 400);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return sendError(res, 'Invalid email or password', 401);
      }
      if (error.message === 'Phone number is required') {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  },

  /**
   * Refresh access token
   * @param req
   * @param res
   * @param next
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400);
      }
      const result = await authService.refreshAccessToken(refreshToken);
      return sendSuccess(res, 'Token refreshed successfully', result);
    } catch (error: any) {
      if (error.message.includes('expired') || error.message.includes('Invalid') || error.message.includes('not found')) {
        return sendError(res, error.message, 401);
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

  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await authService.getAllCustomers();
      return sendSuccess(res, 'Customers retrieved successfully', customers);
    } catch (error) {
      next(error);
    }
  },

  async toggleBlockCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      const result = await authService.toggleBlockCustomer(id, Boolean(isBlocked));
      return sendSuccess(res, `Customer status updated successfully`, result);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { name, phone, email, avatarUrl } = req.body;
      const profile = await authService.updateProfile(userId, { name, phone, email, avatarUrl });
      return sendSuccess(res, 'Profile updated successfully', profile);
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No avatar file uploaded', 400);
      }

      const mime = req.file.mimetype || 'image/png';
      const base64 = req.file.buffer.toString('base64');
      let avatarUrl = `data:${mime};base64,${base64}`;

      try {
        const cloudUrl = await uploadToCloudinary(req.file.buffer, 'user_avatars');
        if (cloudUrl && !cloudUrl.includes('unsplash')) {
          avatarUrl = cloudUrl;
        }
      } catch (err) {
        // Fallback to base64 data URI
      }

      return sendSuccess(res, 'Avatar uploaded successfully', { avatarUrl });
    } catch (error) {
      next(error);
    }
  },
};
