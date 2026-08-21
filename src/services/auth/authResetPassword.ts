import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { PREDEFINED_ADMINS } from './authAdminLogin';

export async function resetPassword(identifierInput: string, newPasswordInput: string) {
  const identifier = (identifierInput || '').trim();
  const newPassword = (newPasswordInput || '').trim();

  if (!identifier) {
    throw new Error('Mobile number or email address is required.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 digits/characters.');
  }

  // Ensure password_hash column exists in users table
  try {
    await dbPool.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL');
  } catch (_e) {
    // Column already exists
  }

  const isEmail = identifier.includes('@');
  let user: RowDataPacket | null = null;

  if (isEmail) {
    const emailLower = identifier.toLowerCase();
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE LOWER(email) = ?', [emailLower]);
    if (rows.length > 0) {
      user = rows[0];
    } else {
      // Check if email matches a predefined admin
      const predefinedAdmin = PREDEFINED_ADMINS[emailLower];
      if (predefinedAdmin) {
        const userId = `admin_${Date.now()}`;
        const defaultPhone = predefinedAdmin.phone || `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
        try {
          await dbPool.query(
            'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, defaultPhone, predefinedAdmin.name, emailLower, 'ADMIN', 0, true]
          );
        } catch (_err) {
          const fallbackPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
          await dbPool.query(
            'INSERT INTO users (id, phone, name, email, role, reward_points, gold_member) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, fallbackPhone, predefinedAdmin.name, emailLower, 'ADMIN', 0, true]
          );
        }
        const [newRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);
        user = newRows[0];
      }
    }
  } else {
    const cleaned = identifier.replace(/\D/g, '');
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE phone = ? OR phone = ?',
      [identifier, `+91${cleaned}`]
    );
    if (rows.length > 0) {
      user = rows[0];
    }
  }

  if (!user) {
    throw new Error('Account not found with provided mobile number or email.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await dbPool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);

  return {
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
    userId: user.id,
  };
}
