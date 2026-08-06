import { UserRole } from '../types';

export const ROLE_ADMIN: UserRole = 'ADMIN';
export const ROLE_KITCHEN: UserRole = 'KITCHEN';
export const ROLE_WAITER: UserRole = 'WAITER';
export const STAFF_ROLES: UserRole[] = [ROLE_ADMIN, ROLE_KITCHEN, ROLE_WAITER];

export const ERROR_MESSAGES = {
  ACCESS_DENIED: 'Access denied. You are not authorized to view this order.',
} as const;
