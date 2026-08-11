import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { createAndSaveTokens, refreshAccessToken } from './authTokens';
import { notificationService } from '../notification.service';

export { refreshAccessToken };

export const PREDEFINED_ADMINS: Record<string, { name: string; phone: string; passwordHash: string; adminType: string }> = {
  [(process.env.ADMIN_EMAIL || 'admin@restaurant.com').toLowerCase()]: {
    name: process.env.ADMIN_NAME || 'Super Admin',
    phone: process.env.ADMIN_PHONE || '',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'default_admin_pass', 10),
    adminType: process.env.ADMIN_TYPE || 'super_admin',
  },
};

export async function adminLogin(emailInput: string, password: string) {
  const email = (emailInput || '').toLowerCase().trim();
  const predefinedAdmin = PREDEFINED_ADMINS[email];

  if (predefinedAdmin) {
    const isPasswordValid = await bcrypt.compare(password, predefinedAdmin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'ADMIN']
    );

    let user: any;
    if (rows.length === 0) {
      const userId = `admin_${Date.now()}`;
      await dbPool.query(
        'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, predefinedAdmin.phone, predefinedAdmin.name, email, 'ADMIN', 1000, true]
      );
      user = {
        id: userId,
        phone: predefinedAdmin.phone,
        name: predefinedAdmin.name,
        email,
        role: 'ADMIN',
      };
    } else {
      user = rows[0];
      if (user.phone !== predefinedAdmin.phone || user.name !== predefinedAdmin.name) {
        await dbPool.query('UPDATE users SET phone = ?, name = ? WHERE id = ?', [
          predefinedAdmin.phone,
          predefinedAdmin.name,
          user.id,
        ]);
        user.phone = predefinedAdmin.phone;
        user.name = predefinedAdmin.name;
      }
    }

    const { accessToken, refreshToken } = await createAndSaveTokens(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email || email,
        role: user.role,
        adminType: predefinedAdmin.adminType,
      },
      accessToken,
      refreshToken,
    };
  }

  const [dbAdminRows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, 'ADMIN']
  );

  if (dbAdminRows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const dbUser = dbAdminRows[0];
  const { accessToken, refreshToken } = await createAndSaveTokens(dbUser);

  return {
    user: {
      id: dbUser.id,
      phone: dbUser.phone,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      adminType: 'restaurant_admin',
    },
    accessToken,
    refreshToken,
  };
}

export async function loginWithPhone(phoneInput: string, nameInput?: string) {
  const phone = (phoneInput || '').trim();
  if (!phone) {
    throw new Error('Phone number is required');
  }

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE phone = ?', [phone]);

  let user: any;
  if (rows.length === 0) {
    throw new Error('User not found');
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
    'Logged In Successfully',
    `Welcome back, ${user.name || 'valued customer'}! You have logged in successfully.`,
    'GENERAL'
  ).catch(() => {});

  notificationService.notifyAdmins(
    'User Logged In',
    `User ${user.name || 'Customer'} (${user.phone}) has logged in.`,
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

export async function loginWithEmail(emailInput: string, password: string) {
  const email = (emailInput || '').toLowerCase().trim();
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  const user = rows[0];
  const predefinedAdmin = PREDEFINED_ADMINS[email];
  if (predefinedAdmin) {
    const isPasswordValid = await bcrypt.compare(password, predefinedAdmin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
  }

  const { accessToken, refreshToken } = await createAndSaveTokens(user);

  // Dynamically notify user and admin about login
  notificationService.createNotification(
    user.id,
    'Logged In Successfully',
    `Welcome back, ${user.name || 'valued customer'}! You have logged in successfully.`,
    'GENERAL'
  ).catch(() => {});

  notificationService.notifyAdmins(
    'User Logged In',
    `User ${user.name || 'Customer'} (${user.email || user.phone}) has logged in.`,
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
