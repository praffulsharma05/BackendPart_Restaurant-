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

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS reward_settings (
        id INT PRIMARY KEY DEFAULT 1,
        reward_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        max_points_per_order INT NOT NULL DEFAULT 0,
        monthly_point_limit INT NOT NULL DEFAULT 0,
        point_expiry_days INT NOT NULL DEFAULT 0,
        redemption_ratio DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        rating_reward_points INT NOT NULL DEFAULT 10,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    try {
      await dbPool.query(`ALTER TABLE reward_settings ADD COLUMN rating_reward_points INT NOT NULL DEFAULT 10`);
    } catch (_e) {}
  },

  /**
   * Get Admin Reward Settings configuration
   */
  async getRewardSettings() {
    await this.initTables();
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM reward_settings WHERE id = 1');
      if (rows.length > 0) {
        const r = rows[0];
        return {
          rewardPercentage: Number(r.reward_percentage || 0),
          maxPointsPerOrder: Number(r.max_points_per_order || 0),
          monthlyPointLimit: Number(r.monthly_point_limit || 0),
          pointExpiryDays: Number(r.point_expiry_days || 0),
          redemptionRatio: Number(r.redemption_ratio || 0),
          ratingRewardPoints: Number(r.rating_reward_points ?? 10),
          isActive: Boolean(r.is_active),
        };
      } else {
        await dbPool.query(`
          INSERT INTO reward_settings (id, reward_percentage, max_points_per_order, monthly_point_limit, point_expiry_days, redemption_ratio, rating_reward_points, is_active)
          VALUES (1, 0.00, 0, 0, 0, 0.00, 10, FALSE)
        `);
        return {
          rewardPercentage: 0,
          maxPointsPerOrder: 0,
          monthlyPointLimit: 0,
          pointExpiryDays: 0,
          redemptionRatio: 0,
          ratingRewardPoints: 10,
          isActive: false,
        };
      }
    } catch (_e) {
      return {
        rewardPercentage: 0,
        maxPointsPerOrder: 0,
        monthlyPointLimit: 0,
        pointExpiryDays: 0,
        redemptionRatio: 0,
        ratingRewardPoints: 10,
        isActive: false,
      };
    }
  },

  /**
   * Save / Update Admin Reward Settings configuration
   */
  async updateRewardSettings(data: any) {
    await this.initTables();
    const rewardPercentage = data.rewardPercentage !== undefined ? Number(data.rewardPercentage) : 0;
    const maxPointsPerOrder = data.maxPointsPerOrder !== undefined ? Number(data.maxPointsPerOrder) : 0;
    const monthlyPointLimit = data.monthlyPointLimit !== undefined ? Number(data.monthlyPointLimit) : 0;
    const pointExpiryDays = data.pointExpiryDays !== undefined ? Number(data.pointExpiryDays) : 0;
    const redemptionRatio = data.redemptionRatio !== undefined ? Number(data.redemptionRatio) : 0;
    const ratingRewardPoints = data.ratingRewardPoints !== undefined ? Number(data.ratingRewardPoints) : 10;
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : false;

    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM reward_settings WHERE id = 1');
      if (rows.length === 0) {
        await dbPool.query(
          `INSERT INTO reward_settings (id, reward_percentage, max_points_per_order, monthly_point_limit, point_expiry_days, redemption_ratio, rating_reward_points, is_active)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
          [rewardPercentage, maxPointsPerOrder, monthlyPointLimit, pointExpiryDays, redemptionRatio, ratingRewardPoints, isActive]
        );
      } else {
        await dbPool.query(
          `UPDATE reward_settings SET 
            reward_percentage = ?,
            max_points_per_order = ?,
            monthly_point_limit = ?,
            point_expiry_days = ?,
            redemption_ratio = ?,
            rating_reward_points = ?,
            is_active = ?
           WHERE id = 1`,
          [rewardPercentage, maxPointsPerOrder, monthlyPointLimit, pointExpiryDays, redemptionRatio, ratingRewardPoints, isActive]
        );
      }
    } catch (err) {
      console.error('Failed to update reward_settings in DB:', err);
    }
    return this.getRewardSettings();
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

    // Sync totalPoints strictly with reward_transactions sum if transactions exist
    if (historyRows.length > 0) {
      try {
        const [txnSumRows] = await dbPool.query<RowDataPacket[]>(
          `SELECT COALESCE(SUM(CASE WHEN type = 'EARNED' THEN points ELSE -points END), 0) as calcTotal
           FROM reward_transactions 
           WHERE user_id = ?`,
          [userId]
        );
        if (txnSumRows.length > 0) {
          totalPoints = Math.max(0, Number(txnSumRows[0].calcTotal));
          await dbPool.query('UPDATE users SET reward_points = ? WHERE id = ?', [totalPoints, userId]);
        }
      } catch (_e) {}
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

  async getVouchers(): Promise<Array<{ id: string; code: string; discount: number; pointsCost: number }>> {
    return [];
  },

  async redeemVoucher(userId: string, voucherId: string) {
    const vouchers = await this.getVouchers();
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) throw new Error('Voucher not found');

    const [userRows] = await dbPool.query<RowDataPacket[]>(
      'SELECT reward_points FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) throw new Error('User not found');

    const currentPoints = userRows[0].reward_points || 0;
    if (currentPoints < voucher.pointsCost) {
      throw new Error('Not enough reward points');
    }

    const newPoints = currentPoints - voucher.pointsCost;
    await dbPool.query('UPDATE users SET reward_points = ? WHERE id = ?', [newPoints, userId]);

    return { remainingPoints: newPoints, voucher };
  },
};
