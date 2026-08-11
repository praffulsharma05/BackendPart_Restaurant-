import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { CreateOrderInput } from '../../types';

export async function resolveOrderUser(connection: PoolConnection, userId: string, input: CreateOrderInput): Promise<string> {
  let targetUserId = userId && userId.trim() ? userId.trim() : null;
  try {
    const uniquePhone = (input.customerPhone || '').trim();
    let userRow: any = null;

    if (uniquePhone) {
      const [byPhone] = await connection.query<RowDataPacket[]>('SELECT id, name, role FROM users WHERE phone = ?', [uniquePhone]);
      if (byPhone.length > 0) {
        userRow = byPhone[0];
        targetUserId = userRow.id;
      }
    }

    if (!userRow && targetUserId) {
      const [byId] = await connection.query<RowDataPacket[]>('SELECT id, name, role FROM users WHERE id = ?', [targetUserId]);
      if (byId.length > 0) {
        userRow = byId[0];
      }
    }

    if (!userRow) {
      if (!targetUserId || targetUserId === 'u101') {
        targetUserId = `u_${Date.now()}`;
      }
      const finalPhone = uniquePhone || `+91${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const displayName = input.customerName || 'Gourmet Customer';

      await connection.query(
        `INSERT INTO users (id, phone, name, role, reward_points) 
         VALUES (?, ?, ?, 'CUSTOMER', 100)`,
        [targetUserId, finalPhone, displayName]
      );
    } else {
      if (input.customerName && userRow.role === 'CUSTOMER') {
        const currentName = userRow.name || '';
        if (!currentName || currentName === 'Gourmet Customer' || currentName.startsWith('Customer')) {
          await connection.query('UPDATE users SET name = ? WHERE id = ?', [input.customerName, targetUserId]);
        }
      }
    }
  } catch (err) {
    console.error('Failed to create/resolve order user:', err);
    targetUserId = `u_fallback_${Date.now()}`;
    const fallbackPhone = `+91_fb_${Date.now()}`;
    const displayName = input.customerName || 'Gourmet Customer';
    try {
      await connection.query(
        `INSERT INTO users (id, phone, name, role, reward_points) 
         VALUES (?, ?, ?, 'CUSTOMER', 100)`,
        [targetUserId, fallbackPhone, displayName]
      );
    } catch (_ignore) { }
  }
  return targetUserId || `u_${Date.now()}`;
}
