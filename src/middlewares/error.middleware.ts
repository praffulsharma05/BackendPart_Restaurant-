import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

/**
 * Global Centralized Error Handling Middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Sanitize body to avoid logging sensitive passwords
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';

  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl || req.url}`, {
    statusCode,
    message,
    stack: err.stack,
    query: req.query,
    params: req.params,
    body: Object.keys(sanitizedBody).length ? sanitizedBody : undefined,
  });

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
