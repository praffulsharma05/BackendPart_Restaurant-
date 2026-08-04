import { dbPool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { InventoryStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const menuService = {
  /**
   *
   */
  async getCategories() {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_categories WHERE is_active = TRUE ORDER BY display_order ASC');
    return rows;
  },

  /**
   * Ensure columns exist on menu_items table
   */
  async ensureColumnsExist() {
    try {
      await dbPool.query("ALTER TABLE menu_items ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE");
    } catch {
      // Ignore if column already exists
    }
    try {
      await dbPool.query("ALTER TABLE menu_items ADD COLUMN prep_time_minutes INT DEFAULT 15");
    } catch {
      // Ignore if column already exists
    }
    try {
      await dbPool.query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(30)");
    } catch {
      // Ignore if column already exists
    }
  },

  /**
   * Get all menu items
   */
  async getAllMenuItems(
    includeHidden: boolean = false,
    categoryName?: string,
    search?: string,
    filters?: { minRating?: number; priceRange?: string; spiceLevel?: string; sortBy?: string }
  ) {
    await this.ensureColumnsExist();
    let sql = 'SELECT * FROM menu_items WHERE (is_deleted IS NULL OR is_deleted = FALSE)';
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
          'SELECT id, name, price FROM customization_options WHERE menu_item_id = ? AND is_deleted = FALSE',
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
          prepTimeMinutes: item.prep_time_minutes ? Number(item.prep_time_minutes) : 15,
          ingredients: ingredients.map((i) => i.ingredient_name),
          options: options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) })),
        };
      })
    );

    let filtered = result;

    if (filters) {
      if (filters.minRating && filters.minRating > 0) {
        filtered = filtered.filter((item) => item.rating >= filters.minRating!);
      }

      if (filters.priceRange) {
        if (filters.priceRange === 'under100') {
          filtered = filtered.filter((item) => item.price < 100);
        } else if (filters.priceRange === '100_300') {
          filtered = filtered.filter((item) => item.price >= 100 && item.price <= 300);
        } else if (filters.priceRange === 'above300') {
          filtered = filtered.filter((item) => item.price > 300);
        }
      }

      if (filters.spiceLevel) {
        const level = filters.spiceLevel.toLowerCase();
        filtered = filtered.filter((item) => {
          const nameLower = item.name.toLowerCase();
          const descLower = item.description ? item.description.toLowerCase() : '';
          
          if (level === 'mild') {
            return (
              nameLower.includes('mild') || 
              nameLower.includes('sweet') || 
              nameLower.includes('butter') || 
              nameLower.includes('cream') || 
              nameLower.includes('naan') || 
              nameLower.includes('roti') || 
              nameLower.includes('paratha') ||
              (!nameLower.includes('masala') && !nameLower.includes('chilli') && !nameLower.includes('spicy') && !nameLower.includes('tadka') && !nameLower.includes('kadai'))
            );
          } else if (level === 'medium') {
            return (
              nameLower.includes('medium') || 
              nameLower.includes('dal') || 
              nameLower.includes('paneer') || 
              nameLower.includes('rice') || 
              nameLower.includes('jeera')
            );
          } else if (level === 'spicy') {
            return (
              nameLower.includes('spicy') || 
              nameLower.includes('masala') || 
              nameLower.includes('chilli') || 
              nameLower.includes('pepper') || 
              nameLower.includes('tadka') || 
              nameLower.includes('kadai') || 
              descLower.includes('spicy') || 
              descLower.includes('chilli')
            );
          } else if (level === 'extra_spicy') {
            return (
              nameLower.includes('extra spicy') || 
              nameLower.includes('kolhapuri') || 
              nameLower.includes('vindaloo') || 
              nameLower.includes('peri') || 
              descLower.includes('extra spicy') || 
              descLower.includes('very spicy')
            );
          }
          return true;
        });
      }

      if (filters.sortBy) {
        if (filters.sortBy === 'rating_high') {
          filtered.sort((a, b) => b.rating - a.rating);
        } else if (filters.sortBy === 'price_low') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price_high') {
          filtered.sort((a, b) => b.price - a.price);
        }
      }
    }

    return filtered;
  },

  /**
   * Fetch soft-deleted / archived menu items
   */
  async getArchivedMenuItems() {
    await this.ensureColumnsExist();
    const [items] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM menu_items WHERE is_deleted = TRUE ORDER BY created_at DESC'
    );

    const result = await Promise.all(
      items.map(async (item) => {
        const [ingredients] = await dbPool.query<RowDataPacket[]>(
          'SELECT ingredient_name FROM menu_item_ingredients WHERE menu_item_id = ?',
          [item.id]
        );
        const [options] = await dbPool.query<RowDataPacket[]>(
          'SELECT id, name, price FROM customization_options WHERE menu_item_id = ? AND is_deleted = FALSE',
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
          prepTimeMinutes: item.prep_time_minutes ? Number(item.prep_time_minutes) : 15,
          ingredients: ingredients.map((i) => i.ingredient_name),
          options: options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) })),
        };
      })
    );

    return result;
  },

  /**
   *
   * @param id
   */
  async getMenuItemById(id: string) {
    await this.ensureColumnsExist();
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (rows.length === 0) return null;

    const item = rows[0];
    const [ingredients] = await dbPool.query<RowDataPacket[]>(
      'SELECT ingredient_name FROM menu_item_ingredients WHERE menu_item_id = ?',
      [id]
    );
    const [options] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, name, price FROM customization_options WHERE menu_item_id = ? AND is_deleted = FALSE',
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
      prepTimeMinutes: item.prep_time_minutes ? Number(item.prep_time_minutes) : 15,
      ingredients: ingredients.map((i) => i.ingredient_name),
      options: options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) })),
    };
  },

  /**
   *
   * @param data
   */
  async createMenuItem(data: any) {
    await this.ensureColumnsExist();
    const id = `m_${Date.now()}`;
    const { name, description, price, category, imageUrl, isVegetarian, prepTimeMinutes = 15, ingredients = [], options = [] } = data;

    // Get category ID
    const [cats] = await dbPool.query<RowDataPacket[]>('SELECT id FROM menu_categories WHERE name = ? LIMIT 1', [category]);
    const categoryId = cats.length > 0 ? cats[0].id : 1;

    await dbPool.query(
      `INSERT INTO menu_items (id, category_id, name, description, price, category, image_url, is_vegetarian, is_hidden, inventory_status, prep_time_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'AVAILABLE', ?)`,
      [id, categoryId, name, description, price, category, imageUrl || '', isVegetarian ? 1 : 0, Number(prepTimeMinutes) || 15]
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

  /**
   *
   * @param id
   * @param data
   */
  async updateMenuItem(id: string, data: any) {
    await this.ensureColumnsExist();
    const { name, description, price, category, imageUrl, isVegetarian, isHidden, inventoryStatus, prepTimeMinutes } = data;

    await dbPool.query(
      `UPDATE menu_items SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        image_url = COALESCE(?, image_url),
        is_vegetarian = COALESCE(?, is_vegetarian),
        is_hidden = COALESCE(?, is_hidden),
        inventory_status = COALESCE(?, inventory_status),
        prep_time_minutes = COALESCE(?, prep_time_minutes)
       WHERE id = ?`,
      [name, description, price, category, imageUrl, isVegetarian, isHidden, inventoryStatus, prepTimeMinutes ? Number(prepTimeMinutes) : null, id]
    );

    return this.getMenuItemById(id);
  },

  /**
   *
   * @param id
   * @param status
   */
  async updateInventoryStatus(id: string, status: InventoryStatus) {
    await dbPool.query('UPDATE menu_items SET inventory_status = ? WHERE id = ?', [status, id]);
    return this.getMenuItemById(id);
  },

  /**
   *
   * @param id
   * @param isHidden
   */
  async toggleHideMenuItem(id: string, isHidden: boolean) {
    await dbPool.query('UPDATE menu_items SET is_hidden = ? WHERE id = ?', [isHidden, id]);
    return this.getMenuItemById(id);
  },

  /**
   * Soft Delete a menu item
   */
  async deleteMenuItem(id: string) {
    await this.ensureColumnsExist();
    const [result] = await dbPool.query<ResultSetHeader>('UPDATE menu_items SET is_deleted = TRUE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Restore a soft-deleted menu item
   */
  async restoreMenuItem(id: string) {
    await this.ensureColumnsExist();
    const [result] = await dbPool.query<ResultSetHeader>('UPDATE menu_items SET is_deleted = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Permanently delete a menu item
   */
  async permanentDeleteMenuItem(id: string) {
    const [result] = await dbPool.query<ResultSetHeader>('DELETE FROM menu_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Get all customizations for a menu item
   */
  async getCustomizationsByMenuItemId(menuItemId: string) {
    const [options] = await dbPool.query<RowDataPacket[]>(
      'SELECT id, name, price FROM customization_options WHERE menu_item_id = ? AND is_deleted = FALSE',
      [menuItemId]
    );
    return options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) }));
  },

  /**
   * Add a customization option to a menu item
   */
  async addCustomizationOption(menuItemId: string, data: { name: string; price: number }) {
    const optId = uuidv4();
    await dbPool.query('INSERT INTO customization_options (id, menu_item_id, name, price) VALUES (?, ?, ?, ?)', [
      optId,
      menuItemId,
      data.name,
      data.price,
    ]);
    return { id: optId, name: data.name, price: data.price };
  },

  /**
   * Update a customization option
   */
  async updateCustomizationOption(menuItemId: string, customizationId: string, data: { name: string; price: number }) {
    await dbPool.query('UPDATE customization_options SET name = ?, price = ? WHERE id = ? AND menu_item_id = ?', [
      data.name,
      data.price,
      customizationId,
      menuItemId,
    ]);
    return { id: customizationId, name: data.name, price: data.price };
  },

  /**
   * Delete a customization option (Soft Delete)
   */
  async deleteCustomizationOption(menuItemId: string, customizationId: string) {
    const [result] = await dbPool.query<ResultSetHeader>(
      'UPDATE customization_options SET is_deleted = TRUE WHERE id = ? AND menu_item_id = ?',
      [customizationId, menuItemId]
    );
    return result.affectedRows > 0;
  },
};
