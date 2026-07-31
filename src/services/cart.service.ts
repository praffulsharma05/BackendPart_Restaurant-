import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const cartService = {
  /**
   * Ensure cart_items table exists and character collation is aligned
   */
  async initTable() {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected_options TEXT,
        custom_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await dbPool.query(`
        ALTER TABLE cart_items
        MODIFY id VARCHAR(36) CHARACTER SET utf8mb4,
        MODIFY user_id VARCHAR(36) CHARACTER SET utf8mb4,
        MODIFY menu_item_id VARCHAR(36) CHARACTER SET utf8mb4;
      `);
    } catch (_err) {
      // Ignore if table alter is redundant
    }
  },

  /**
   * Get user cart items joined with menu item details using collation safe join
   */
  async getCart(userId: string) {
    await this.initTable();
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT ci.id as cart_item_id, ci.menu_item_id, ci.quantity, ci.selected_options, ci.custom_instructions,
              m.id as menu_id, m.name, m.description, m.price, m.image_url, m.is_vegetarian, m.rating, m.category
       FROM cart_items ci
       LEFT JOIN menu_items m ON CONVERT(ci.menu_item_id USING utf8mb4) = CONVERT(m.id USING utf8mb4)
       WHERE CONVERT(ci.user_id USING utf8mb4) = CONVERT(? USING utf8mb4)
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    return rows.map((r) => ({
      menuItem: {
        id: r.menu_id || r.menu_item_id,
        name: r.name || 'Gourmet Delicacy',
        description: r.description || 'Freshly prepared specialty dish.',
        price: Number(r.price || 180),
        imageUrl: r.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
        isVegetarian: Boolean(r.is_vegetarian),
        rating: Number(r.rating || 4.5),
        category: r.category || 'Main Course',
      },
      quantity: r.quantity,
      selectedOptions: r.selected_options ? JSON.parse(r.selected_options) : [],
      customInstructions: r.custom_instructions || '',
    }));
  },

  /**
   * Add item to cart or update quantity if exists
   */
  async addToCart(
    userId: string,
    menuItemId: string,
    quantity: number = 1,
    selectedOptions?: string[],
    customInstructions?: string
  ) {
    await this.initTable();
    const [existing] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, quantity FROM cart_items WHERE CONVERT(user_id USING utf8mb4) = CONVERT(? USING utf8mb4) AND CONVERT(menu_item_id USING utf8mb4) = CONVERT(? USING utf8mb4)',
      [userId, menuItemId]
    );

    const optionsJson = selectedOptions ? JSON.stringify(selectedOptions) : null;

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await dbPool.query(
        'UPDATE cart_items SET quantity = ?, selected_options = ?, custom_instructions = ? WHERE id = ?',
        [newQty, optionsJson, customInstructions || '', existing[0].id]
      );
    } else {
      const id = uuidv4();
      await dbPool.query(
        'INSERT INTO cart_items (id, user_id, menu_item_id, quantity, selected_options, custom_instructions) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, menuItemId, quantity, optionsJson, customInstructions || '']
      );
    }

    return this.getCart(userId);
  },

  /**
   * Update quantity of a item in cart
   */
  async updateQuantity(userId: string, menuItemId: string, delta: number) {
    await this.initTable();
    const [existing] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, quantity FROM cart_items WHERE CONVERT(user_id USING utf8mb4) = CONVERT(? USING utf8mb4) AND CONVERT(menu_item_id USING utf8mb4) = CONVERT(? USING utf8mb4)',
      [userId, menuItemId]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + delta;
      if (newQty <= 0) {
        await dbPool.query('DELETE FROM cart_items WHERE id = ?', [existing[0].id]);
      } else {
        await dbPool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
      }
    }

    return this.getCart(userId);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, menuItemId: string) {
    await this.initTable();
    await dbPool.query('DELETE FROM cart_items WHERE CONVERT(user_id USING utf8mb4) = CONVERT(? USING utf8mb4) AND CONVERT(menu_item_id USING utf8mb4) = CONVERT(? USING utf8mb4)', [userId, menuItemId]);
    return this.getCart(userId);
  },

  /**
   * Clear all items in user's cart
   */
  async clearCart(userId: string) {
    await this.initTable();
    await dbPool.query('DELETE FROM cart_items WHERE CONVERT(user_id USING utf8mb4) = CONVERT(? USING utf8mb4)', [userId]);
    return [];
  },
};
