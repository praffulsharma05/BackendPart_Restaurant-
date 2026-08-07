import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { InventoryStatus } from '../../types';

export async function ensureColumnsExist() {
  try {
    await dbPool.query("ALTER TABLE menu_items ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE");
  } catch {
    // Ignore
  }
  try {
    await dbPool.query("ALTER TABLE menu_items ADD COLUMN prep_time_minutes INT DEFAULT 15");
  } catch {
    // Ignore
  }
  try {
    await dbPool.query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(30)");
  } catch {
    // Ignore
  }
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS master_customizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch {
    // Ignore
  }
}

export async function getCategories() {
  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_categories WHERE is_active = TRUE ORDER BY display_order ASC');
  return rows;
}

export async function getAllMenuItems(
  includeHidden: boolean = false,
  categoryName?: string,
  search?: string,
  filters?: { minRating?: number; priceRange?: string; spiceLevel?: string; sortBy?: string }
) {
  await ensureColumnsExist();
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
}

export async function getArchivedMenuItems() {
  await ensureColumnsExist();
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
}

export async function getMenuItemById(id: string) {
  await ensureColumnsExist();
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
}

export async function getCustomizationsByMenuItemId(menuItemId: string) {
  const [options] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, price FROM customization_options WHERE menu_item_id = ? AND is_deleted = FALSE',
    [menuItemId]
  );
  return options.map((o) => ({ id: o.id, name: o.name, price: Number(o.price) }));
}

export async function getMasterCustomizations() {
  await ensureColumnsExist();
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, price FROM master_customizations WHERE is_deleted = FALSE ORDER BY created_at DESC'
  );
  return rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price) }));
}
