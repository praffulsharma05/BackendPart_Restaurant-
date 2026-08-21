import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { saveLocalFile } from '../utils/localStorage';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const authController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phone, identifier, password } = req.body;
      const input = identifier || email || phone;
      logger.info('[Auth] Admin login attempt', { input });
      if (!input || !password) {
        logger.warn('[Auth] Admin login failed: Missing email/phone or password');
        return sendError(res, 'Email/Mobile number and password are required', 400);
      }
      const result = await authService.adminLogin(input, password);
      logger.info('[Auth] Admin login successful', { input });
      return sendSuccess(res, 'Admin login successful', result);
    } catch (error: any) {
      logger.error('[Auth] Error in adminLogin:', error);
      if (error.message === 'Invalid email or password') {
        return sendError(res, 'Invalid email/phone or password', 401);
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
      logger.info('[Auth] Login attempt', { phone, email });

      // Phone-based login
      if (phone) {
        const result = await authService.loginWithPhone(phone, name);
        logger.info('[Auth] Phone login successful', { phone });
        return sendSuccess(res, 'Login successful', result);
      }

      // Email-based login
      if (email && password) {
        const result = await authService.loginWithEmail(email, password);
        logger.info('[Auth] Email login successful', { email });
        return sendSuccess(res, 'Login successful', result);
      }

      logger.warn('[Auth] Login failed: Invalid payload');
      return sendError(res, 'Please provide phone number or email with password', 400);
    } catch (error: any) {
      logger.error('[Auth] Error in login:', error);
      if (error.message === 'Invalid email or password' || error.message === 'User not found') {
        return sendError(res, error.message, 401);
      }
      if (error.message === 'Phone number is required') {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, email, name, password } = req.body;
      logger.info('[Auth] Registration attempt', { phone, email, name });
      if (!phone || !name) {
        logger.warn('[Auth] Registration failed: Missing phone or name');
        return sendError(res, 'Phone number and name are required', 400);
      }
      const result = await authService.register(phone, email, name, password);
      logger.info('[Auth] Registration successful', { phone });
      return sendSuccess(res, 'Registration successful', result, 201);
    } catch (error: any) {
      logger.error('[Auth] Error in register:', error);
      return sendError(res, error.message || 'Registration failed', 400);
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
      logger.info('[Auth] Token refresh attempt');
      if (!refreshToken) {
        logger.warn('[Auth] Token refresh failed: Missing refresh token');
        return sendError(res, 'Refresh token is required', 400);
      }
      const result = await authService.refreshAccessToken(refreshToken);
      logger.info('[Auth] Token refreshed successfully');
      return sendSuccess(res, 'Token refreshed successfully', result);
    } catch (error: any) {
      logger.error('[Auth] Error in refreshToken:', error);
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
      logger.info('[Auth] Fetching user profile', { userId });
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const profile = await authService.getUserProfile(userId);
      if (!profile) return sendError(res, 'User not found', 444);

      return sendSuccess(res, 'User profile retrieved successfully', profile);
    } catch (error) {
      logger.error('[Auth] Error in getProfile:', error);
      next(error);
    }
  },

  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Auth] Fetching all customers');
      const customers = await authService.getAllCustomers();
      return sendSuccess(res, 'Customers retrieved successfully', customers);
    } catch (error) {
      logger.error('[Auth] Error in getAllCustomers:', error);
      next(error);
    }
  },

  async toggleBlockCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      logger.info('[Auth] Toggling block customer status', { customerId: id, isBlocked });
      const result = await authService.toggleBlockCustomer(id, Boolean(isBlocked));
      return sendSuccess(res, `Customer status updated successfully`, result);
    } catch (error) {
      logger.error('[Auth] Error in toggleBlockCustomer:', error);
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      logger.info('[Auth] Updating profile', { userId });
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { name, phone, email, avatarUrl } = req.body;
      const profile = await authService.updateProfile(userId, { name, phone, email, avatarUrl });
      return sendSuccess(res, 'Profile updated successfully', profile);
    } catch (error) {
      logger.error('[Auth] Error in updateProfile:', error);
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Auth] Uploading avatar');
      if (!req.file) {
        logger.warn('[Auth] Upload avatar failed: No file uploaded');
        return sendError(res, 'No avatar file uploaded', 400);
      }

      const avatarUrl = saveLocalFile(req.file.buffer, req.file.originalname, 'user_avatars');
      return sendSuccess(res, 'Avatar uploaded successfully', { avatarUrl });
    } catch (error) {
      logger.error('[Auth] Error in uploadAvatar:', error);
      next(error);
    }
  },

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info('[Auth] Deleting customer', { id });
      const result = await authService.deleteCustomer(id);
      if (!result) {
        return sendError(res, 'Customer not found or already deleted', 404);
      }
      return sendSuccess(res, 'Customer and all associated data deleted successfully');
    } catch (error) {
      logger.error('[Auth] Error in deleteCustomer:', error);
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, newPassword, confirmPassword } = req.body;
      logger.info('[Auth] Password reset attempt', { identifier });

      if (!identifier || !newPassword) {
        return sendError(res, 'Identifier (mobile or email) and new password are required', 400);
      }

      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return sendError(res, 'New password and confirm password do not match', 400);
      }

      const result = await authService.resetPassword(identifier, newPassword);
      logger.info('[Auth] Password reset successful', { identifier });
      return sendSuccess(res, result.message, result);
    } catch (error: any) {
      logger.error('[Auth] Error in resetPassword:', error);
      return sendError(res, error.message || 'Password reset failed', 400);
    }
  },
};

