import { dbPool } from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
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
  /**
   *
   * @param emailInput
   * @param password
   */
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

  /**
   * Login with phone number — auto-registers new users
   * @param phoneInput - User phone number
   * @param nameInput - Optional display name for new users
   */
  async loginWithPhone(phoneInput: string, nameInput?: string) {
    const phone = (phoneInput || '').trim();
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Check if user exists in database
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE phone = ?', [phone]);

    let user: any;
    if (rows.length === 0) {
      // Create new user (auto-register)
      const userId = `u_${Date.now()}`;
      const defaultName = nameInput || `Customer (${phone.slice(-4)})`;
      await dbPool.query(
        'INSERT INTO users (id, phone, name, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, phone, defaultName, 'CUSTOMER', 100, false]
      );
      user = { id: userId, phone, name: defaultName, role: 'CUSTOMER', reward_points: 100, gold_member: false };
    } else {
      user = rows[0];
      // Update name if provided and user exists
      if (nameInput && nameInput !== user.name) {
        await dbPool.query('UPDATE users SET name = ? WHERE id = ?', [nameInput, user.id]);
        user.name = nameInput;
      }
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

  /**
   * Login with email and password
   * @param emailInput - User email
   * @param password - User password
   */
  async loginWithEmail(emailInput: string, password: string) {
    const email = (emailInput || '').toLowerCase().trim();
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Look up user by email
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = rows[0];

    // For admin users, check predefined admin passwords
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

  /**
   * Refresh an expired access token using a valid refresh token
   * @param refreshTokenInput - The refresh token
   */
  async refreshAccessToken(refreshTokenInput: string) {
    if (!refreshTokenInput) {
      throw new Error('Refresh token is required');
    }

    // Verify the refresh token signature
    const decoded = verifyRefreshToken(refreshTokenInput);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in DB and is not expired
    const [tokenRows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [refreshTokenInput]
    );

    if (tokenRows.length === 0) {
      throw new Error('Refresh token not found or expired');
    }

    const tokenRecord = tokenRows[0];

    // Fetch the user
    const [userRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [tokenRecord.user_id]);
    if (userRows.length === 0) {
      throw new Error('User not found');
    }

    const user = userRows[0];
    const payload = { id: user.id, phone: user.phone, role: user.role as UserRole, name: user.name };

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate: delete old refresh token, insert new one
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
  },

  /**
   *
   * @param userId
   */
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

  async getAllCustomers() {
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
  },

  async toggleBlockCustomer(userId: string, isBlocked: boolean) {
    try {
      await dbPool.query('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
    } catch (_e) {}

    await dbPool.query('UPDATE users SET is_blocked = ? WHERE id = ?', [isBlocked, userId]);
    return { id: userId, isBlocked };
  },
};
