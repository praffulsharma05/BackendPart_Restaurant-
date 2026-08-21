import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { createAndSaveTokens } from './authTokens';

export const PREDEFINED_ADMINS: Record<string, { name: string; phone: string; passwordHash: string; adminType: string }> = {
  ...(process.env.ADMIN_EMAIL
    ? {
        [process.env.ADMIN_EMAIL.toLowerCase()]: {
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
          name: process.env.DESIGNER_ADMIN_NAME || 'Designer Jas',
          phone: process.env.DESIGNER_ADMIN_PHONE || '',
          passwordHash: bcrypt.hashSync(process.env.DESIGNER_ADMIN_PASSWORD || '', 10),
          adminType: process.env.DESIGNER_ADMIN_TYPE || 'super_admin',
        },
      }
    : {}),
};

export async function adminLogin(emailInput: string, password: string) {
  const email = (emailInput || '').toLowerCase().trim();
  const predefinedAdmin = PREDEFINED_ADMINS[email];

  // Fetch admin user from DB if exists
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE LOWER(email) = ? AND role = ?',
    [email, 'ADMIN']
  );

  let user: any = rows.length > 0 ? rows[0] : null;
  let isPasswordValid = false;

  // 1. Check if DB has a custom password_hash set for this user (e.g., after password reset)
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

  // 3. Ensure user exists in DB
  if (!user && predefinedAdmin) {
    const userId = `admin_${Date.now()}`;
    await dbPool.query(
      'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, predefinedAdmin.phone, predefinedAdmin.name, email, 'ADMIN', 0, true]
    );
    user = {
      id: userId,
      phone: predefinedAdmin.phone,
      name: predefinedAdmin.name,
      email,
      role: 'ADMIN',
    };
  } else if (user && predefinedAdmin) {
    if (user.phone !== predefinedAdmin.phone || user.name !== predefinedAdmin.name) {
      await dbPool.query('UPDATE users SET phone = ?, name = ? WHERE id = ?', [
        predefinedAdmin.phone || user.phone,
        predefinedAdmin.name || user.name,
        user.id,
      ]);
      user.phone = predefinedAdmin.phone || user.phone;
      user.name = predefinedAdmin.name || user.name;
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
      email: user.email || email,
      role: user.role,
      adminType: predefinedAdmin ? predefinedAdmin.adminType : 'restaurant_admin',
    },
    accessToken,
    refreshToken,
  };
}
