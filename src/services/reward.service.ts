import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const rewardService = {
  async getUserRewardSummary(userId: string) {
    const [userRows] = await dbPool.query<RowDataPacket[]>('SELECT reward_points, gold_member FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return null;

    const totalPoints = userRows[0].reward_points || 0;
    const isGold = Boolean(userRows[0].gold_member);

    // Monthly points earned
    const [monthlyRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(points), 0) as monthlyEarned 
       FROM reward_transactions 
       WHERE user_id = ? AND type = 'EARNED' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
      [userId]
    );
    const monthlyPointsEarned = Number(monthlyRows[0].monthlyEarned);

    // Points expiring in next 30 days (6 month expiry rule)
    const [expiringRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(points), 0) as expiringSoon 
       FROM reward_transactions 
       WHERE user_id = ? AND type = 'EARNED' AND expiry_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)`,
      [userId]
    );
    const pointsExpiringSoon = Number(expiringRows[0].expiringSoon);

    // Transaction history
    const [historyRows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    return {
      totalPoints,
      goldMember: isGold,
      monthlyPointsEarned,
      monthlyLimit: 1000,
      pointsExpiringSoon,
      history: historyRows.map((h) => ({
        id: h.id,
        orderId: h.order_id,
        points: h.points,
        type: h.type,
        expiryDate: h.expiry_date,
        createdAt: h.created_at,
      })),
    };
  },
};
