import { UserRole } from '../types';

export const ROLE_ADMIN: UserRole = 'ADMIN';
export const ROLE_KITCHEN: UserRole = 'KITCHEN';
export const ROLE_WAITER: UserRole = 'WAITER';
export const STAFF_ROLES: UserRole[] = [ROLE_ADMIN, ROLE_KITCHEN, ROLE_WAITER];

export const ERROR_MESSAGES = {
  ACCESS_DENIED: 'Access denied. You are not authorized to view this order.',
} as const;

export const API_CONFIG = {
  get BASE_URL() {
    return process.env.BASE_URL || '';
  },
  UPLOADS_PREFIX: '/api/uploads/',
  RELATIVE_UPLOADS_PREFIX: '/uploads/',
  API_PREFIX: '/api',
} as const;

export * from './menu.constants';
