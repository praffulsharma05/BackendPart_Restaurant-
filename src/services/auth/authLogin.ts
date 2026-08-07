import { dbPool } from '../../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { UserRole } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

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

    const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await dbPool.query('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [
      tokenId,
      user.id,
      refreshToken,
      expiresAt,
    ]);

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
  const payload = { id: dbUser.id, phone: dbUser.phone, role: dbUser.role as UserRole, name: dbUser.name };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

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

  const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await dbPool.query('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [
    tokenId,
    user.id,
    refreshToken,
    expiresAt,
  ]);

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

  const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await dbPool.query('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [
    tokenId,
    user.id,
    refreshToken,
    expiresAt,
  ]);

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

export async function refreshAccessToken(refreshTokenInput: string) {
  if (!refreshTokenInput) {
    throw new Error('Refresh token is required');
  }

  const decoded = verifyRefreshToken(refreshTokenInput);
  if (!decoded) {
    throw new Error('Invalid or expired refresh token');
  }

  const [tokenRows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refreshTokenInput]
  );

  if (tokenRows.length === 0) {
    throw new Error('Refresh token not found or expired');
  }

  const tokenRecord = tokenRows[0];
  const [userRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [tokenRecord.user_id]);
  if (userRows.length === 0) {
    throw new Error('User not found');
  }

  const user = userRows[0];
  const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await dbPool.query('DELETE FROM refresh_tokens WHERE id = ?', [tokenRecord.id]);

  const newTokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await dbPool.query('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [
    newTokenId,
    user.id,
    newRefreshToken,
    expiresAt,
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
