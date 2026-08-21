import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { createAndSaveTokens } from './authTokens';
import { logger } from '../../utils/logger';

export interface PredefinedAdmin {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  adminType: string;
}

export const PREDEFINED_ADMINS: Record<string, PredefinedAdmin> = {
  ...(process.env.ADMIN_EMAIL
    ? {
        [process.env.ADMIN_EMAIL.toLowerCase()]: {
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          name: process.env.ADMIN_NAME || 'Super Admin',
          phone: process.env.ADMIN_PHONE || '',
          passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || '', 10),
          adminType: process.env.ADMIN_TYPE || 'super_admin',
        },
      }
    : {}),
  ...(process.env.DESIGNER_ADMIN_EMAIL
    ? {
        [process.env.DESIGNER_ADMIN_EMAIL.toLowerCase()]: {
          email: process.env.DESIGNER_ADMIN_EMAIL.toLowerCase(),
          name: process.env.DESIGNER_ADMIN_NAME || 'Designer Jas',
          phone: process.env.DESIGNER_ADMIN_PHONE || '',
          passwordHash: bcrypt.hashSync(process.env.DESIGNER_ADMIN_PASSWORD || '', 10),
          adminType: process.env.DESIGNER_ADMIN_TYPE || 'super_admin',
        },
      }
    : {}),
};

export async function adminLogin(identifierInput: string, password: string) {
  const input = (identifierInput || '').trim();
  const lowerInput = input.toLowerCase();
  const cleanedPhone = input.replace(/\D/g, '');
  const formattedPhone = cleanedPhone ? (input.startsWith('+') ? input : `+91${cleanedPhone}`) : input;

  // Lookup predefined admin by email or phone
  let predefinedAdmin = PREDEFINED_ADMINS[lowerInput] ||
    Object.values(PREDEFINED_ADMINS).find(
      a => (a.phone && (a.phone === input || a.phone === formattedPhone))
    );

  // Fetch admin user from DB if exists (by email OR phone)
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE (LOWER(email) = ? OR phone = ? OR phone = ?) AND role = ?',
    [lowerInput, input, formattedPhone, 'ADMIN']
  );

  let user: any = rows.length > 0 ? rows[0] : null;
  let isPasswordValid = false;

  // 1. Check if DB has a custom password_hash set for this user (e.g., set after password reset)
  if (user && user.password_hash) {
    isPasswordValid = await bcrypt.compare(password, user.password_hash);
  }

  // 2. If DB password check didn't pass, fallback to predefined admin password check
  if (!isPasswordValid && predefinedAdmin) {
    isPasswordValid = await bcrypt.compare(password, predefinedAdmin.passwordHash);
  }

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // 3. Ensure user exists in DB & sync details safely
  const adminEmail = user?.email || predefinedAdmin?.email || lowerInput;
  const adminPhone = predefinedAdmin?.phone || user?.phone || formattedPhone;
  const adminName = predefinedAdmin?.name || user?.name || 'Admin';

  if (!user && predefinedAdmin) {
    const userId = `admin_${Date.now()}`;
    try {
      await dbPool.query(
        'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, adminPhone, adminName, adminEmail, 'ADMIN', 0, true]
      );
    } catch (dbErr: any) {
      logger.warn('[Auth] Error inserting admin user to DB (e.g. duplicate phone), continuing with fallback:', dbErr.message);
      // Try inserting with unique placeholder phone if phone is duplicate
      try {
        const safePhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
        await dbPool.query(
          'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, safePhone, adminName, adminEmail, 'ADMIN', 0, true]
        );
      } catch (_e) {
        // ignore error if insertion still fails
      }
    }

    user = {
      id: userId,
      phone: adminPhone,
      name: adminName,
      email: adminEmail,
      role: 'ADMIN',
    };
  } else if (user && predefinedAdmin) {
    if (user.phone !== predefinedAdmin.phone || user.name !== predefinedAdmin.name) {
      try {
        await dbPool.query('UPDATE users SET phone = ?, name = ? WHERE id = ?', [
          predefinedAdmin.phone || user.phone,
          predefinedAdmin.name || user.name,
          user.id,
        ]);
        user.phone = predefinedAdmin.phone || user.phone;
        user.name = predefinedAdmin.name || user.name;
      } catch (dbErr: any) {
        logger.warn('[Auth] Error updating admin details in DB (e.g. duplicate phone), ignoring update:', dbErr.message);
      }
    }
  }

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { accessToken, refreshToken } = await createAndSaveTokens(user);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email || adminEmail,
      role: user.role,
      adminType: predefinedAdmin ? predefinedAdmin.adminType : 'super_admin',
    },
    accessToken,
    refreshToken,
  };
}

