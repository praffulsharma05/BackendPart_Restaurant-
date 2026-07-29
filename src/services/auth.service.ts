import { dbPool } from '../config/db';
import { admin, firebaseInitialized } from '../config/firebase';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// Admin credentials loaded from .env
// Admin credentials list (Super Admin & Secondary Admins)
const PREDEFINED_ADMINS: Record<string, { name: string; phone: string; passwordHash: string; adminType: string }> = {
  [(process.env.ADMIN_EMAIL || 'admin@luxedine.com').toLowerCase()]: {
    name: process.env.ADMIN_NAME || 'Prafful Sharma (Super Admin)',
    phone: process.env.ADMIN_PHONE || '+919999999999',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Pr@fful_213', 10),
    adminType: 'super_admin',
  },
  'prafful@restaurant.com': {
    name: 'Prafful Sharma (Restaurant Admin)',
    phone: '+919876543210',
    passwordHash: bcrypt.hashSync('prafful123', 10),
    adminType: 'restaurant_manager',
  },
  'praffulsharma38@gmail.com': {
    name: 'Prafful Sharma (Super Admin)',
    phone: '+919999999999',
    passwordHash: bcrypt.hashSync('Pr@fful_213', 10),
    adminType: 'super_admin',
  },
};

export const authService = {
  async adminLogin(emailInput: string, password: string) {
    const email = (emailInput || '').toLowerCase().trim();

    // Check predefined admins list first
    const predefinedAdmin = PREDEFINED_ADMINS[email];

    if (predefinedAdmin) {
      const isPasswordValid = await bcrypt.compare(password, predefinedAdmin.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if DB record exists or create it
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

    // Check database for registered admin user
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
  },

  async verifyFirebaseAndLogin(firebaseToken: string, phoneInput?: string, password?: string) {
    let phone = phoneInput || '+919999999999';

    if (firebaseInitialized && firebaseToken && firebaseToken !== 'mock_token') {
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        if (decodedToken.phone_number) {
          phone = decodedToken.phone_number;
        }
      } catch (err) {
        console.warn('⚠️ Firebase token verification failed, using fallback phone authentication:', (err as Error).message);
      }
    }

    // Check if user exists in database
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE phone = ?', [phone]);

    let user: any;
    if (rows.length === 0) {
      // Create new user
      const userId = `u_${Date.now()}`;
      const defaultName = `Customer (${phone.slice(-4)})`;
      await dbPool.query(
        'INSERT INTO users (id, phone, name, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, phone, defaultName, 'CUSTOMER', 100, false]
      );
      user = { id: userId, phone, name: defaultName, role: 'CUSTOMER', rewardPoints: 100, goldMember: false };
    } else {
      user = rows[0];
    }

    const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to DB
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
  },

  async getUserProfile(userId: string) {
    const [users] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return null;

    const user = users[0];
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
  },
};
