import { dbPool } from '../../config/db';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { UserRole } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { PREDEFINED_ADMINS } from './authLogin';
import { deleteCustomer } from './authCustomerDelete';
import { notificationService } from '../notification.service';
import { AUTH_STRINGS } from './authStrings';

export { deleteCustomer };

export async function getUserProfile(userId: string) {
  const [users] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return null;

  let user = users[0];

  // Sync reward_points strictly with transaction history when transactions exist
  try {
    const [txns] = await dbPool.query<RowDataPacket[]>('SELECT id FROM reward_transactions WHERE user_id = ? LIMIT 1', [userId]);
    if (txns.length > 0) {
      const [txnSumRows] = await dbPool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(CASE WHEN type = 'EARNED' THEN points ELSE -points END), 0) as calcTotal
         FROM reward_transactions 
         WHERE user_id = ?`,
        [userId]
      );
      if (txnSumRows.length > 0) {
        user.reward_points = Math.max(0, Number(txnSumRows[0].calcTotal));
        await dbPool.query('UPDATE users SET reward_points = ? WHERE id = ?', [user.reward_points, userId]);
      }
    }
  } catch (_e) {}

  if (user.role === 'ADMIN' && user.email) {
    const email = user.email.toLowerCase().trim();
    const predefinedAdmin = PREDEFINED_ADMINS[email];
    if (predefinedAdmin && (user.phone !== predefinedAdmin.phone || user.name !== predefinedAdmin.name)) {
      await dbPool.query('UPDATE users SET phone = ?, name = ? WHERE id = ?', [
        predefinedAdmin.phone,
        predefinedAdmin.name,
        user.id,
      ]);
      user.phone = predefinedAdmin.phone;
      user.name = predefinedAdmin.name;
    }
  }

  const [vehicles] = await dbPool.query<RowDataPacket[]>('SELECT * FROM saved_vehicles WHERE user_id = ?', [userId]);

  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role,
    rewardPoints: user.reward_points,
    goldMember: Boolean(user.gold_member),
    savedVehicles: vehicles.map((v) => ({
      id: v.id,
      carNumber: v.car_number,
      carModel: v.car_model,
      isDefault: Boolean(v.is_default),
    })),
  };
}

export async function getAllCustomers() {
  try {
    await dbPool.query('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
  } catch (_e) {}

  const [users] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, phone, name, email, avatar_url, reward_points, gold_member, is_blocked, created_at FROM users WHERE role = "CUSTOMER" ORDER BY created_at DESC'
  );

  return Promise.all(
    users.map(async (u) => {
      const [orders] = await dbPool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as totalSpent, MAX(created_at) as lastOrderDate FROM orders WHERE user_id = ? AND status != "Cancelled"',
        [u.id]
      );
      const stats = orders[0] || { count: 0, totalSpent: 0, lastOrderDate: null };

      return {
        id: u.id,
        name: u.name || 'Valued Customer',
        email: u.email || 'N/A',
        phone: u.phone,
        avatar: u.avatar_url || '',
        totalOrders: Number(stats.count) || 0,
        totalSpent: Number(stats.totalSpent) || 0,
        rewardPoints: u.reward_points || 0,
        isBlocked: Boolean(u.is_blocked),
        joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        lastOrderDate: stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : 'No orders yet',
      };
    })
  );
}

export async function toggleBlockCustomer(userId: string, isBlocked: boolean) {
  try {
    await dbPool.query('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
  } catch (_e) {}

  await dbPool.query('UPDATE users SET is_blocked = ? WHERE id = ?', [isBlocked, userId]);
  return { id: userId, isBlocked };
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string; email?: string; avatarUrl?: string }) {
  const { name, phone, email, avatarUrl } = data;
  const updates: string[] = [];
  const params: any[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatarUrl);
  }

  if (updates.length > 0) {
    params.push(userId);
    await dbPool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  return getUserProfile(userId);
}

export async function register(phoneInput: string, emailInput: string, nameInput: string, passwordInput: string) {
  const phone = (phoneInput || '').trim();
  const email = (emailInput || '').toLowerCase().trim();
  const name = (nameInput || '').trim();

  const [existingPhone] = await dbPool.query<RowDataPacket[]>('SELECT id FROM users WHERE phone = ?', [phone]);
  if (existingPhone.length > 0) {
    throw new Error(AUTH_STRINGS.ERRORS.PHONE_REGISTERED);
  }
  if (email) {
    const [existingEmail] = await dbPool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      throw new Error(AUTH_STRINGS.ERRORS.EMAIL_REGISTERED);
    }
  }

  const userId = `u_${Date.now()}`;
  let initialPoints = 0;

  try {
    const { rewardService } = await import('../reward.service');
    await rewardService.initTables();
    const rewardCfg = await rewardService.getRewardSettings();
    if (rewardCfg.isWelcomeRewardActive && rewardCfg.welcomeRewardPoints > 0) {
      initialPoints = Number(rewardCfg.welcomeRewardPoints);
    }
  } catch (err: any) {
    console.error('[AuthRegistration] Error fetching reward settings:', err);
  }

  await dbPool.query(
    'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, phone, name, email || null, 'CUSTOMER', initialPoints, false]
  );

  if (initialPoints > 0) {
    try {
      await dbPool.query(
        `INSERT INTO reward_transactions (id, user_id, points, type, description)
         VALUES (?, ?, ?, 'EARNED', 'Welcome bonus reward points for creating account')`,
        [`txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, userId, initialPoints]
      );
    } catch (txnErr: any) {
      console.error('[AuthRegistration] Error inserting welcome reward transaction:', txnErr);
    }
  }

  const payload = { id: userId, phone, role: 'CUSTOMER' as UserRole, name };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await dbPool.query('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [
    tokenId,
    userId,
    refreshToken,
    expiresAt,
  ]);

  // Notify user and admin about new account registration
  notificationService.createNotification(
    userId,
    AUTH_STRINGS.NOTIFICATIONS.WELCOME_TITLE,
    AUTH_STRINGS.NOTIFICATIONS.WELCOME_BODY(name),
    'GENERAL'
  ).catch(() => {});

  notificationService.notifyAdmins(
    AUTH_STRINGS.NOTIFICATIONS.ADMIN_REGISTER_TITLE,
    AUTH_STRINGS.NOTIFICATIONS.ADMIN_REGISTER_BODY(name, phone, email),
    'USER_REGISTER'
  ).catch((err) => console.error('[Auth] Registration notification error:', err));

  return {
    user: {
      id: userId,
      phone,
      name,
      email: email || null,
      role: 'CUSTOMER',
      rewardPoints: initialPoints,
      goldMember: false,
    },
    accessToken,
    refreshToken,
  };
}
