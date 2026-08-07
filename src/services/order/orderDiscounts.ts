import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderInput } from '../../types';

export async function processOrderDiscounts(
  connection: PoolConnection,
  input: CreateOrderInput,
  targetUserId: string,
  subtotal: number,
  orderId: string
) {
  let discount = 0;
  if (input.couponCode) {
    const [offerRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM offers WHERE code = ? AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())',
      [input.couponCode]
    );
    if (offerRows.length > 0) {
      const offer = offerRows[0];
      const [usedCouponRows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) as cnt FROM orders WHERE user_id = ? AND coupon_code = ?',
        [targetUserId, input.couponCode]
      );

      if (usedCouponRows[0].cnt === 0 && subtotal >= Number(offer.min_order_amount)) {
        if (offer.offer_type === 'PERCENTAGE') {
          discount = (subtotal * Number(offer.discount_percent)) / 100;
          if (offer.max_discount_amount > 0 && discount > Number(offer.max_discount_amount)) {
            discount = Number(offer.max_discount_amount);
          }
        } else if (offer.offer_type === 'FLAT' || offer.offer_type === 'FIRST_ORDER') {
          discount = Number(offer.discount_amount);
        }
      }
    }
  }

  let rewardPointsUsed = 0;
  if (input.redeemPoints && input.redeemPoints > 0) {
    const [userRows] = await connection.query<RowDataPacket[]>('SELECT reward_points FROM users WHERE id = ?', [targetUserId]);
    const currentPoints = userRows[0]?.reward_points || 0;
    rewardPointsUsed = Math.min(currentPoints, input.redeemPoints);
    const pointsDiscount = rewardPointsUsed / 10;
    discount += pointsDiscount;

    await connection.query('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [rewardPointsUsed, targetUserId]);
    await connection.query(
      'INSERT INTO reward_transactions (id, user_id, order_id, points, type, expiry_date) VALUES (?, ?, ?, ?, ?, CURRENT_DATE)',
      [uuidv4(), targetUserId, orderId, rewardPointsUsed, 'SPENT']
    );
  }

  return { discount, rewardPointsUsed };
}
