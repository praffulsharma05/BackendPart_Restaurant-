import { dbPool } from '../config/db';
import { logger } from '../utils/logger';

export interface ReviewData {
  orderId?: string;
  userId?: string;
  menuItemId?: string;
  rating: number;
  tags?: string[];
  comment?: string;
}

export interface ReviewRecord {
  id: string;
  orderId: string | null;
  userId: string | null;
  menuItemId: string | null;
  rating: number;
  tags: string[];
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userPhone?: string;
  itemName?: string;
}

export async function createReviewService(data: ReviewData): Promise<ReviewRecord> {
  const connection = await dbPool.getConnection();
  try {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { orderId = null, userId = null, menuItemId = null, rating, tags = [], comment = '' } = data;
    const tagsJson = JSON.stringify(tags);

    await connection.query(
      `INSERT INTO reviews (id, order_id, user_id, menu_item_id, rating, tags, comment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, orderId, userId, menuItemId, rating, tagsJson, comment]
    );

    const [rows]: any = await connection.query(`SELECT * FROM reviews WHERE id = ?`, [id]);
    const row = rows[0];

    return {
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      menuItemId: row.menu_item_id,
      rating: row.rating,
      tags: row.tags ? JSON.parse(row.tags) : [],
      comment: row.comment,
      status: row.status,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } finally {
    connection.release();
  }
}

export async function getAdminReviewsService(statusFilter?: string): Promise<ReviewRecord[]> {
  const connection = await dbPool.getConnection();
  try {
    let sql = `
      SELECT r.*, u.name as user_name, u.phone as user_phone, m.name as item_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN menu_items m ON r.menu_item_id = m.id
    `;
    const params: any[] = [];

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      sql += ` WHERE r.status = ?`;
      params.push(statusFilter);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rows]: any = await connection.query(sql, params);

    return rows.map((r: any) => ({
      id: r.id,
      orderId: r.order_id,
      userId: r.user_id,
      menuItemId: r.menu_item_id,
      rating: r.rating,
      tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
      comment: r.comment,
      status: r.status,
      adminNotes: r.admin_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userName: r.user_name || 'Guest Customer',
      userPhone: r.user_phone || 'N/A',
      itemName: r.item_name || 'General Restaurant Experience',
    }));
  } finally {
    connection.release();
  }
}

export async function getItemApprovedReviewsService(menuItemId: string) {
  const connection = await dbPool.getConnection();
  try {
    const [rows]: any = await connection.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.menu_item_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [menuItemId]
    );

    const reviews = rows.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
      comment: r.comment,
      userName: r.user_name || 'Verified Customer',
      createdAt: r.created_at,
    }));

    const [avgRows]: any = await connection.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       WHERE menu_item_id = ? AND status = 'approved'`,
      [menuItemId]
    );

    const avgRating = avgRows[0]?.avg_rating ? Number(Number(avgRows[0].avg_rating).toFixed(1)) : null;
    const reviewCount = avgRows[0]?.review_count ? Number(avgRows[0].review_count) : 0;

    return {
      reviews,
      avgRating,
      reviewCount,
    };
  } finally {
    connection.release();
  }
}

export async function updateReviewStatusService(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<boolean> {
  const connection = await dbPool.getConnection();
  try {
    const [existingRows]: any = await connection.query(`SELECT * FROM reviews WHERE id = ?`, [id]);
    if (!existingRows || existingRows.length === 0) {
      return false;
    }

    const review = existingRows[0];

    await connection.query(
      `UPDATE reviews SET status = ?, admin_notes = ? WHERE id = ?`,
      [status, adminNotes || null, id]
    );

    if (status === 'approved') {
      // 1. Update Menu Item average rating if linked to a specific item
      if (review.menu_item_id) {
        const [avgRows]: any = await connection.query(
          `SELECT AVG(rating) as avg_rating FROM reviews WHERE menu_item_id = ? AND status = 'approved'`,
          [review.menu_item_id]
        );
        const newAvg = avgRows[0]?.avg_rating ? Number(Number(avgRows[0].avg_rating).toFixed(1)) : 4.5;
        await connection.query(`UPDATE menu_items SET rating = ? WHERE id = ?`, [newAvg, review.menu_item_id]);
      }

      // 2. Award +10 loyalty reward points to user if user_id present
      if (review.user_id) {
        try {
          await connection.query(`UPDATE users SET reward_points = reward_points + 10 WHERE id = ?`, [review.user_id]);
          await connection.query(
            `INSERT INTO reward_transactions (id, user_id, points, type, description)
             VALUES (?, ?, 10, 'EARNED', 'Bonus reward for submitted review approval')`,
            [`txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, review.user_id]
          );
        } catch (e: any) {
          logger.warn(`Could not award review bonus points: ${e.message}`);
        }
      }
    }

    return true;
  } finally {
    connection.release();
  }
}
