import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export async function deleteCustomer(userId: string) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    const [userOrders] = await connection.query<RowDataPacket[]>('SELECT id FROM orders WHERE user_id = ?', [userId]);
    const orderIds = userOrders.map((o) => o.id);

    if (orderIds.length > 0) {
      await connection.query('DELETE FROM order_fulfillment_car WHERE order_id IN (?)', [orderIds]);
      await connection.query('DELETE FROM order_fulfillment_dine_in WHERE order_id IN (?)', [orderIds]);
      await connection.query('DELETE FROM order_fulfillment_pre_order WHERE order_id IN (?)', [orderIds]);
      await connection.query('DELETE FROM order_items WHERE order_id IN (?)', [orderIds]);
      await connection.query('DELETE FROM reward_transactions WHERE order_id IN (?)', [orderIds]);
      await connection.query('DELETE FROM orders WHERE user_id = ?', [userId]);
    }

    await connection.query('DELETE FROM reward_transactions WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM saved_vehicles WHERE user_id = ?', [userId]);

    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    return (result as any).affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
