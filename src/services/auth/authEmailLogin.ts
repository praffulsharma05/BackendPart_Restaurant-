import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { createAndSaveTokens } from './authTokens';
import { PREDEFINED_ADMINS } from './authAdminLogin';
import { notificationService } from '../notification.service';
import { AUTH_STRINGS } from './authStrings';

export async function loginWithEmail(emailInput: string, password: string) {
  const email = (emailInput || '').toLowerCase().trim();
  if (!email || !password) {
    throw new Error(AUTH_STRINGS.ERRORS.EMAIL_PASSWORD_REQUIRED);
  }

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    throw new Error(AUTH_STRINGS.ERRORS.USER_NOT_FOUND);
  }

  const user = rows[0];
  const predefinedAdmin = PREDEFINED_ADMINS[email];
  if (predefinedAdmin) {
    const isPasswordValid = await bcrypt.compare(password, predefinedAdmin.passwordHash);
    if (!isPasswordValid) {
      throw new Error(AUTH_STRINGS.ERRORS.INVALID_CREDENTIALS);
    }
  }

  const { accessToken, refreshToken } = await createAndSaveTokens(user);

  // Dynamically notify user and admin about login
  notificationService.createNotification(
    user.id,
    AUTH_STRINGS.NOTIFICATIONS.LOGIN_SUCCESS_TITLE,
    AUTH_STRINGS.NOTIFICATIONS.LOGIN_SUCCESS_BODY(user.name),
    'GENERAL'
  ).catch(() => {});

  notificationService.notifyAdmins(
    AUTH_STRINGS.NOTIFICATIONS.ADMIN_USER_LOGIN_TITLE,
    AUTH_STRINGS.NOTIFICATIONS.ADMIN_USER_LOGIN_BODY(user.name, user.email || user.phone),
    'USER_LOGIN'
  ).catch((err) => console.error('[Auth] Login notification error:', err));

  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      role: user.role,
      rewardPoints: user.reward_points,
      goldMember: Boolean(user.gold_member),
    },
    accessToken,
    refreshToken,
  };
}
