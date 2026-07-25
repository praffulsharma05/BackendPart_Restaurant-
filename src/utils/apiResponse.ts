import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: any;
}

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode: number = 200, meta?: any): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendError(res: Response, message: string, statusCode: number = 400, errors?: any): Response {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(responsePayload);
}
