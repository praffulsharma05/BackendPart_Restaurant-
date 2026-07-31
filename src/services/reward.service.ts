import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const rewardService = {
  /**
   * Ensure reward tables exist
   */
  async initTables() {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS reward_transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        order_id VARCHAR(36),
        points INT NOT NULL,
        type ENUM('EARNED', 'SPENT') NOT NULL,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  },

  /**
   * Get user reward summary
   */
  async getUserRewardSummary(userId: string) {
    await this.initTables();

    let totalPoints = 0;
    let isGold = false;

    try {
      const [userRows] = await dbPool.query<RowDataPacket[]>(
        'SELECT reward_points, gold_member FROM users WHERE id = ?',
        [userId]
      );
      if (userRows.length > 0) {
        totalPoints = userRows[0].reward_points || 0;
        isGold = Boolean(userRows[0].gold_member);
      }
    } catch (_e) {
      // User table check failed or guest user
    }

    // Monthly points earned
    let monthlyPointsEarned = 0;
    try {
      const [monthlyRows] = await dbPool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(points), 0) as monthlyEarned 
         FROM reward_transactions 
         WHERE user_id = ? AND type = 'EARNED' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
        [userId]
      );
      monthlyPointsEarned = Number(monthlyRows[0]?.monthlyEarned || 0);
    } catch (_e) {
      monthlyPointsEarned = 0;
    }

    // Points expiring in next 30 days
    let pointsExpiringSoon = 0;
    try {
      const [expiringRows] = await dbPool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(points), 0) as expiringSoon 
         FROM reward_transactions 
         WHERE user_id = ? AND type = 'EARNED' AND expiry_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)`,
        [userId]
      );
      pointsExpiringSoon = Number(expiringRows[0]?.expiringSoon || 0);
    } catch (_e) {
      pointsExpiringSoon = 0;
    }

    // Transaction history
    let historyRows: RowDataPacket[] = [];
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(
        'SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      historyRows = rows;
    } catch (_e) {
      historyRows = [];
    }

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
