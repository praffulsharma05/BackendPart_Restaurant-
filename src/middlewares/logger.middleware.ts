import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Helper to sanitize object data (redact sensitive info, truncate large base64 fields/buffers)
 */
function sanitizeData(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    if (data.length > 30) {
      return `[Array of ${data.length} items]`;
    }
    return data.map(item => sanitizeData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (['password', 'oldPassword', 'newPassword', 'token', 'refreshToken'].includes(key)) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof val === 'string' && val.startsWith('data:image')) {
      sanitized[key] = `[Base64 Image Data (${val.length} bytes)]`;
    } else if (typeof val === 'string' && val.length > 500) {
      sanitized[key] = `${val.substring(0, 250)}... [Truncated ${val.length} chars]`;
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Middleware to log incoming HTTP requests and response details (Request payload & Response payload).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  // Intercept res.json and res.send to capture response body
  let responseBody: any = undefined;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (body: any) {
    responseBody = body;
    return originalJson(body);
  };

  res.send = function (body: any) {
    if (responseBody === undefined) {
      try {
        responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (_e) {
        responseBody = typeof body === 'string' && body.length > 300 ? `${body.substring(0, 300)}...` : body;
      }
    }
    return originalSend(body);
  };

  // Intercept completion of response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const reqBody = Object.keys(req.body || {}).length ? sanitizeData(req.body) : undefined;
    const queryParams = Object.keys(req.query || {}).length ? req.query : undefined;
    const routeParams = Object.keys(req.params || {}).length ? req.params : undefined;
    const sanitizedResp = responseBody !== undefined ? sanitizeData(responseBody) : undefined;

    const reqPayload: Record<string, any> = {};
    if (queryParams) reqPayload.query = queryParams;
    if (routeParams) reqPayload.params = routeParams;
    if (reqBody) reqPayload.body = reqBody;

    const reqStr = Object.keys(reqPayload).length > 0 ? ` | Request: ${JSON.stringify(reqPayload)}` : '';
    const respStr = sanitizedResp !== undefined ? ` | Response: ${JSON.stringify(sanitizedResp)}` : '';

    const logMessage = `[API] ${method} ${originalUrl} ${statusCode} (${duration}ms)${reqStr}${respStr}`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
}

