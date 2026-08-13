import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';
import { UserRole } from '../types';

/**
 *
 * @param req
 * @param res
 * @param next
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['http_authorization'] as string);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. Missing or invalid Authorization header token.', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return sendError(res, 'Invalid or expired access token.', 401);
  }

  req.user = payload;
  next();
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['http_authorization'] as string);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
      return next();
    }
  }

  const guestId = (req.headers['x-guest-id'] as string) || 'guest_user_default';
  req.user = {
    id: guestId,
    phone: '+91 0000000000',
    name: 'Guest User',
    role: 'CUSTOMER' as UserRole,
  };
  next();
}

/**
 *
 * @param allowedRoles
 */
export function authorizeRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden. Role '${req.user.role}' does not have sufficient permissions.`, 403);
    }

    next();
  };
}
