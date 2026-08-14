import { dbPool } from '../config/db';
import { logger } from '../utils/logger';

export interface ReviewData {
  orderId?: string;
  userId?: string;
  menuItemId?: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  tags?: string[];
  comment?: string;
}

export interface ReviewRecord {
  id: string;
  orderId: string | null;
  userId: string | null;
  menuItemId: string | null;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
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
    let { orderId = null, userId = null, menuItemId = null, rating, foodRating, deliveryRating, tags = [], comment = '' } = data;

    // If userId not provided explicitly, attempt resolving from order
    if (!userId && orderId) {
      try {
        const [ordRows]: any = await connection.query(`SELECT user_id FROM orders WHERE id = ?`, [orderId]);
        if (ordRows.length > 0 && ordRows[0].user_id) {
          userId = ordRows[0].user_id;
        }
      } catch (_e) {}
    }

    const calculatedRating = rating || Math.max(foodRating || 0, deliveryRating || 0) || 5;

    // Package detailed multi-criteria tags into JSON if provided
    const mergedTags = [...tags];
    if (foodRating) mergedTags.push(`Food:${foodRating}★`);
    if (deliveryRating) mergedTags.push(`Delivery:${deliveryRating}★`);

    const tagsJson = JSON.stringify(mergedTags);

    await connection.query(
      `INSERT INTO reviews (id, order_id, user_id, menu_item_id, rating, tags, comment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, orderId, userId, menuItemId, calculatedRating, tagsJson, comment]
    );

    const [rows]: any = await connection.query(`SELECT * FROM reviews WHERE id = ?`, [id]);
    const row = rows[0];

    return {
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      menuItemId: row.menu_item_id,
      rating: row.rating,
      foodRating: foodRating || calculatedRating,
      deliveryRating: deliveryRating || calculatedRating,
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
      SELECT r.*, 
             u.name as user_name, 
             u.phone as user_phone, 
             o_u.name as order_user_name,
             o_u.phone as order_user_phone,
             m.name as item_name,
             (
               SELECT GROUP_CONCAT(oi.item_name SEPARATOR ', ')
               FROM order_items oi
               WHERE oi.order_id = r.order_id
             ) as order_item_names
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN users o_u ON o.user_id = o_u.id
      LEFT JOIN menu_items m ON r.menu_item_id = m.id
    `;
    const params: any[] = [];

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      sql += ` WHERE r.status = ?`;
      params.push(statusFilter);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rows]: any = await connection.query(sql, params);

    return rows.map((r: any) => {
      let displayName = r.item_name;
      if (!displayName && r.order_item_names) {
        displayName = `Order Items (${r.order_item_names})`;
      } else if (!displayName && r.order_id) {
        displayName = `Order #${r.order_id.slice(-4).toUpperCase()}`;
      } else if (!displayName) {
        displayName = 'General Restaurant Experience';
      }

      let finalUserName = r.user_name || r.order_user_name;
      if (!finalUserName || finalUserName.toLowerCase().includes('admin')) {
        finalUserName = 'Guest Customer';
      }

      let finalUserPhone = r.user_phone || r.order_user_phone;
      if (!finalUserPhone) {
        finalUserPhone = 'N/A';
      }

      return {
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
        userName: finalUserName,
        userPhone: finalUserPhone,
        itemName: displayName,
      };
    });
  } finally {
    connection.release();
  }
}

export async function getItemApprovedReviewsService(menuItemId: string) {
  const connection = await dbPool.getConnection();
  try {
    const [rows]: any = await connection.query(
      `SELECT DISTINCT r.*, 
              COALESCE(u.name, o_u.name, 'Verified Customer') as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN orders o ON r.order_id = o.id
       LEFT JOIN users o_u ON o.user_id = o_u.id
       LEFT JOIN order_items oi ON r.order_id = oi.order_id
       WHERE (r.menu_item_id = ? OR oi.menu_item_id = ?) AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [menuItemId, menuItemId]
    );

    const reviews = rows.map((r: any) => ({
      id: r.id,
      rating: Number(r.rating),
      tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
      comment: r.comment,
      userName: r.user_name && !r.user_name.toLowerCase().includes('admin') ? r.user_name : 'Verified Customer',
      createdAt: r.created_at,
    }));

    const [avgRows]: any = await connection.query(
      `SELECT AVG(r.rating) as avg_rating, COUNT(DISTINCT r.id) as review_count
       FROM reviews r
       LEFT JOIN order_items oi ON r.order_id = oi.order_id
       WHERE (r.menu_item_id = ? OR oi.menu_item_id = ?) AND r.status = 'approved'`,
      [menuItemId, menuItemId]
    );

    const avgRating = avgRows[0]?.avg_rating ? Number(Number(avgRows[0].avg_rating).toFixed(1)) : null;
    const reviewCount = avgRows[0]?.review_count ? Number(avgRows[0].review_count) : 0;

    // Calculate rating breakdown distribution (1 to 5 stars)
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((rev: any) => {
      const rVal = Math.min(5, Math.max(1, Math.round(Number(rev.rating))));
      distribution[rVal] = (distribution[rVal] || 0) + 1;
    });

    return {
      menuItemId,
      reviews,
      avgRating,
      reviewCount,
      distribution,
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
      const targetMenuItemIds: string[] = [];
      if (review.menu_item_id) {
        targetMenuItemIds.push(String(review.menu_item_id));
      }
      if (review.order_id) {
        try {
          const [orderRows]: any = await connection.query(`SELECT items FROM orders WHERE id = ?`, [review.order_id]);
          if (orderRows && orderRows[0] && orderRows[0].items) {
            const parsedItems = typeof orderRows[0].items === 'string' ? JSON.parse(orderRows[0].items) : orderRows[0].items;
            if (Array.isArray(parsedItems)) {
              parsedItems.forEach((it: any) => {
                const itemId = it.menuItem?.id || it.menu_item_id || it.id;
                if (itemId && !targetMenuItemIds.includes(String(itemId))) {
                  targetMenuItemIds.push(String(itemId));
                }
              });
            }
          }
        } catch (_e) {}
      }

      if (targetMenuItemIds.length === 0) {
        const [allItemRows]: any = await connection.query(`SELECT id FROM menu_items`);
        if (allItemRows && Array.isArray(allItemRows)) {
          allItemRows.forEach((r: any) => targetMenuItemIds.push(String(r.id)));
        }
      }

      for (const mId of targetMenuItemIds) {
        const [itemSpecificAvg]: any = await connection.query(
          `SELECT AVG(r.rating) as avg_rating 
           FROM reviews r
           LEFT JOIN order_items oi ON r.order_id = oi.order_id
           WHERE (r.menu_item_id = ? OR oi.menu_item_id = ?) AND r.status = 'approved'`,
          [mId, mId]
        );
        if (itemSpecificAvg[0]?.avg_rating) {
          const newAvg = Number(Number(itemSpecificAvg[0].avg_rating).toFixed(1));
          await connection.query(`UPDATE menu_items SET rating = ? WHERE id = ?`, [newAvg, mId]);
        } else {
          await connection.query(`UPDATE menu_items SET rating = NULL WHERE id = ?`, [mId]);
        }
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
