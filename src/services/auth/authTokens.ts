import { dbPool } from '../../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { UserRole } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

export async function createAndSaveTokens(user: any) {
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

  return { accessToken, refreshToken };
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
