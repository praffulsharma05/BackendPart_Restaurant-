import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { createAndSaveTokens } from './authTokens';
import { notificationService } from '../notification.service';
import { AUTH_STRINGS } from './authStrings';

export async function loginWithPhone(phoneInput: string, nameInput?: string) {
  const phone = (phoneInput || '').trim();
  if (!phone) {
    throw new Error(AUTH_STRINGS.ERRORS.PHONE_REQUIRED);
  }

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE phone = ?', [phone]);

  let user: any;
  if (rows.length === 0) {
    throw new Error(AUTH_STRINGS.ERRORS.USER_NOT_FOUND);
  } else {
    user = rows[0];
    if (nameInput && nameInput !== user.name) {
      await dbPool.query('UPDATE users SET name = ? WHERE id = ?', [nameInput, user.id]);
      user.name = nameInput;
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
    AUTH_STRINGS.NOTIFICATIONS.ADMIN_USER_LOGIN_BODY(user.name, user.phone),
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
