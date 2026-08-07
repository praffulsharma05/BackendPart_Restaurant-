import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log incoming HTTP requests and response performance/errors.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  // Intercept completion of response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Sanitize body to avoid logging sensitive passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
    if (sanitizedBody.oldPassword) sanitizedBody.oldPassword = '***REDACTED***';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***REDACTED***';

    const logDetails = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      query: Object.keys(req.query).length ? req.query : undefined,
      params: Object.keys(req.params).length ? req.params : undefined,
    };

    if (statusCode >= 500) {
      logger.error(`[HTTP ${statusCode}] ${method} ${originalUrl} (${duration}ms)`, {
        ...logDetails,
        body: Object.keys(sanitizedBody).length ? sanitizedBody : undefined,
      });
    } else if (statusCode >= 400) {
      logger.warn(`[HTTP ${statusCode}] ${method} ${originalUrl} (${duration}ms)`, {
        ...logDetails,
        body: Object.keys(sanitizedBody).length ? sanitizedBody : undefined,
      });
    } else {
      logger.info(`[HTTP ${statusCode}] ${method} ${originalUrl} (${duration}ms)`);
    }
  });

  next();
}
