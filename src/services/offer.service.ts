import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from './notification.service';
export const offerService = {
  /**
   *
   */
  async getActiveOffers() {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM offers WHERE is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())'
    );
    return rows.map((o) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      description: o.description,
      offerType: o.offer_type,
      discountPercent: Number(o.discount_percent),
      discountAmount: Number(o.discount_amount),
      minOrderAmount: Number(o.min_order_amount),
      maxDiscountAmount: Number(o.max_discount_amount),
      validUntil: o.valid_until,
    }));
  },

  /**
   *
   * @param code
   * @param subtotal
   * @param userId
   */
  async validateCouponCode(code: string, subtotal: number, userId: string) {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM offers WHERE code = ? AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())',
      [code]
    );

    if (rows.length === 0) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }

    const offer = rows[0];

    if (subtotal < Number(offer.min_order_amount)) {
      return {
        valid: false,
        message: `Minimum order amount of $${offer.min_order_amount} required to use coupon '${code}'`,
      };
    }

    if (offer.offer_type === 'FIRST_ORDER') {
      const [userOrders] = await dbPool.query<RowDataPacket[]>('SELECT COUNT(*) as cnt FROM orders WHERE user_id = ?', [userId]);
      if (userOrders[0].cnt > 0) {
        return { valid: false, message: "Coupon 'FIRSTORDER' is valid for new customers only" };
      }
    }

    let discount = 0;
    if (offer.offer_type === 'PERCENTAGE') {
      discount = (subtotal * Number(offer.discount_percent)) / 100;
      if (offer.max_discount_amount > 0 && discount > Number(offer.max_discount_amount)) {
        discount = Number(offer.max_discount_amount);
      }
    } else if (offer.offer_type === 'FLAT' || offer.offer_type === 'FIRST_ORDER') {
      discount = Number(offer.discount_amount);
    }

    return {
      valid: true,
      code: offer.code,
      title: offer.title,
      discount: Math.min(discount, subtotal),
    };
  },

  /**
   *
   * @param data
   */
  async createOffer(data: any) {
    const id = uuidv4();
    const { code, title, description, offerType, discountPercent, discountAmount, minOrderAmount, maxDiscountAmount, validUntil } = data;

    await dbPool.query(
      `INSERT INTO offers (id, code, title, description, offer_type, discount_percent, discount_amount, min_order_amount, max_discount_amount, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, code.toUpperCase(), title, description, offerType, discountPercent || 0, discountAmount || 0, minOrderAmount || 0, maxDiscountAmount || 0, validUntil]
    );

    try {
      await notificationService.createNotification(
        'ALL',
        `New Offer: ${title}`,
        description || `Use code ${code.toUpperCase()} on your next order!`,
        'reward'
      );
    } catch (_notifErr) {}

    return { id, ...data };
  },

  /**
   *
   * @param id
   * @param isActive
   */
  async toggleStatus(id: string, isActive: boolean) {
    await dbPool.query('UPDATE offers SET is_active = ? WHERE id = ?', [isActive, id]);
    return { id, isActive };
  },
};
