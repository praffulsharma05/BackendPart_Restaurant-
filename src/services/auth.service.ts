import { dbPool } from '../config/db';
import { admin, firebaseInitialized } from '../config/firebase';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// Admin credentials loaded from .env
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@restaurant.com',
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
  name: process.env.ADMIN_NAME || 'Admin',
  phone: process.env.ADMIN_PHONE || '+910000000000',
  adminType: process.env.ADMIN_TYPE || 'super_admin',
};

export const authService = {
  async adminLogin(email: string, password: string) {
    // Validate credentials
    if (email !== ADMIN_CREDENTIALS.email) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if the admin user exists in the DB
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'ADMIN']
    );

    let user: any;
    if (rows.length === 0) {
      // Create the admin user in the database
      const userId = `admin_${Date.now()}`;
      await dbPool.query(
        'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, ADMIN_CREDENTIALS.phone, ADMIN_CREDENTIALS.name, email, 'ADMIN', 0, false]
      );
      user = {
        id: userId,
        phone: ADMIN_CREDENTIALS.phone,
        name: ADMIN_CREDENTIALS.name,
        email,
        role: 'ADMIN',
      };
    } else {
      user = rows[0];
    }

    const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
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
        adminType: ADMIN_CREDENTIALS.adminType,
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
