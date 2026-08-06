import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserPayload } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_access_key_restaurant_meals_on_wheels_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_restaurant_meals_on_wheels_2026';

/**
 *
 * @param payload
 */
export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 *
 * @param payload
 */
export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 *
 * @param token
 */
export function verifyAccessToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

/**
 *
 * @param token
 */
export function verifyRefreshToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}
