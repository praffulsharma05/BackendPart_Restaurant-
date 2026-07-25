import { dbPool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { InventoryStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const menuService = {
  async getCategories() {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_categories WHERE is_active = TRUE ORDER BY display_order ASC');
    return rows;
  },

  async getAllMenuItems(includeHidden: boolean = false, categoryName?: string, search?: string) {
    let sql = 'SELECT * FROM menu_items WHERE 1=1';
    const params: any[] = [];

    if (!includeHidden) {
      sql += ' AND is_hidden = FALSE';
    }

    if (categoryName) {
      sql += ' AND category = ?';
      params.push(categoryName);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const [items] = await dbPool.query<RowDataPacket[]>(sql, params);

    // Fetch options & ingredients for each dish
    const result = await Promise.all(
      items.map(async (item) => {
        const [ingredients] = await dbPool.query<RowDataPacket[]>(
          'SELECT ingredient_name FROM menu_item_ingredients WHERE menu_item_id = ?',
          [item.id]
        );
        const [options] = await dbPool.query<RowDataPacket[]>(
          'SELECT id, name, price FROM customization_options WHERE menu_item_id = ?',
          [item.id]
        );

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          rating: Number(item.rating),
          category: item.category,
          imageUrl: item.image_url,
          isVegetarian: Boolean(item.is_vegetarian),
          isHidden: Boolean(item.is_hidden),
          inventoryStatus: item.inventory_status as InventoryStatus,
          isSoldOut: item.inventory_status === 'SOLD_OUT',
          ingredients: ingredients.map((i) => i.ingredient_name),
          options: options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) })),
        };
      })
    );

    return result;
  },

  async getMenuItemById(id: string) {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (rows.length === 0) return null;

    const item = rows[0];
    const [ingredients] = await dbPool.query<RowDataPacket[]>(
      'SELECT ingredient_name FROM menu_item_ingredients WHERE menu_item_id = ?',
      [id]
    );
    const [options] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, name, price FROM customization_options WHERE menu_item_id = ?',
      [id]
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      rating: Number(item.rating),
      category: item.category,
      imageUrl: item.image_url,
      isVegetarian: Boolean(item.is_vegetarian),
      isHidden: Boolean(item.is_hidden),
      inventoryStatus: item.inventory_status as InventoryStatus,
      isSoldOut: item.inventory_status === 'SOLD_OUT',
      ingredients: ingredients.map((i) => i.ingredient_name),
      options: options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) })),
    };
  },

  async createMenuItem(data: any) {
    const id = `m_${Date.now()}`;
    const { name, description, price, category, imageUrl, isVegetarian, ingredients = [], options = [] } = data;

    // Get category ID
    const [cats] = await dbPool.query<RowDataPacket[]>('SELECT id FROM menu_categories WHERE name = ? LIMIT 1', [category]);
    const categoryId = cats.length > 0 ? cats[0].id : 1;

    await dbPool.query(
      `INSERT INTO menu_items (id, category_id, name, description, price, category, image_url, is_vegetarian, is_hidden, inventory_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'AVAILABLE')`,
      [id, categoryId, name, description, price, category, imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', isVegetarian ? 1 : 0]
    );

    for (const ing of ingredients) {
      await dbPool.query('INSERT INTO menu_item_ingredients (menu_item_id, ingredient_name) VALUES (?, ?)', [id, ing]);
    }

    for (const opt of options) {
      const optId = uuidv4();
      await dbPool.query('INSERT INTO customization_options (id, menu_item_id, name, price) VALUES (?, ?, ?, ?)', [
        optId,
        id,
        opt.name,
        opt.price,
      ]);
    }

    return this.getMenuItemById(id);
  },

  async updateMenuItem(id: string, data: any) {
    const { name, description, price, category, imageUrl, isVegetarian, isHidden, inventoryStatus } = data;

    await dbPool.query(
      `UPDATE menu_items SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        image_url = COALESCE(?, image_url),
        is_vegetarian = COALESCE(?, is_vegetarian),
        is_hidden = COALESCE(?, is_hidden),
        inventory_status = COALESCE(?, inventory_status)
       WHERE id = ?`,
      [name, description, price, category, imageUrl, isVegetarian, isHidden, inventoryStatus, id]
    );

    return this.getMenuItemById(id);
  },

  async updateInventoryStatus(id: string, status: InventoryStatus) {
    await dbPool.query('UPDATE menu_items SET inventory_status = ? WHERE id = ?', [status, id]);
    return this.getMenuItemById(id);
  },

  async toggleHideMenuItem(id: string, isHidden: boolean) {
    await dbPool.query('UPDATE menu_items SET is_hidden = ? WHERE id = ?', [isHidden, id]);
    return this.getMenuItemById(id);
  },

  async deleteMenuItem(id: string) {
    const [result] = await dbPool.query<ResultSetHeader>('DELETE FROM menu_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
