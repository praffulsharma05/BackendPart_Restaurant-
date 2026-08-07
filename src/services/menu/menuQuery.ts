import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { InventoryStatus } from '../../types';
import { applyBackendMenuFilters } from './menuFilter';

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

  return applyBackendMenuFilters(result, filters);
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
