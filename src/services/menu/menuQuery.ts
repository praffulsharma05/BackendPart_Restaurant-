import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { InventoryStatus } from '../../types';
import { applyBackendMenuFilters } from './menuFilter';
import { getCategories, ensureCategoriesInDb } from './menuCategories';

export { getCategories, ensureCategoriesInDb };

export async function ensureColumnsExist() {
  try {
    await dbPool.query("ALTER TABLE menu_items ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE");
  } catch {}
  try {
    await dbPool.query("ALTER TABLE menu_items ADD COLUMN prep_time_minutes INT DEFAULT 15");
  } catch {}
  try {
    await dbPool.query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(30)");
  } catch {}
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
  } catch {}
}

export async function getAllMenuItems(
  includeHidden: boolean = false,
  categoryName?: string,
  search?: string,
  filters?: { minRating?: number; priceRange?: string; spiceLevel?: string; sortBy?: string }
) {
  await ensureColumnsExist();
  let sql = 'SELECT * FROM menu_items WHERE 1=1';
  const params: any[] = [];

  if (!includeHidden) {
    sql += ' AND is_hidden = FALSE';
  }
  if (categoryName) {
    sql += ' AND category = ?';
    params.push(categoryName);
  }
  if (search && search.trim() !== '') {
    sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  const [rows] = await dbPool.query<RowDataPacket[]>(sql, params);
  let items = rows.map((r) => mapRowToMenuItem(r));

  if (filters) {
    items = applyBackendMenuFilters(items, filters);
  }
  return items;
}

export async function getArchivedMenuItems() {
  await ensureColumnsExist();
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM menu_items WHERE is_deleted = TRUE ORDER BY updated_at DESC'
  );
  return rows.map((r) => mapRowToMenuItem(r));
}

export async function getMenuItemById(id: string) {
  await ensureColumnsExist();
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT * FROM menu_items WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;

  const item: any = mapRowToMenuItem(rows[0]);

  const [ingredients] = await dbPool.query<RowDataPacket[]>(
    'SELECT ingredient_name FROM menu_item_ingredients WHERE menu_item_id = ?',
    [id]
  );
  item.ingredients = ingredients.map((i) => i.ingredient_name);

  const [options] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, price FROM customization_options WHERE menu_item_id = ?',
    [id]
  );
  item.options = options.map((o) => ({
    id: o.id,
    name: o.name,
    price: Number(o.price),
  }));

  return item;
}

export async function getCustomizationsByMenuItemId(menuItemId: string) {
  const [options] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, price FROM customization_options WHERE menu_item_id = ?',
    [menuItemId]
  );
  return options.map((o) => ({
    id: o.id,
    name: o.name,
    price: Number(o.price),
  }));
}

export async function getMasterCustomizations() {
  await ensureColumnsExist();
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, price FROM master_customizations ORDER BY name ASC'
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
  }));
}

function mapRowToMenuItem(r: RowDataPacket) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    category: r.category,
    imageUrl: r.image_url,
    isVegetarian: Boolean(r.is_vegetarian),
    isHidden: Boolean(r.is_hidden),
    inventoryStatus: r.inventory_status as InventoryStatus,
    prepTimeMinutes: Number(r.prep_time_minutes) || 15,
  };
}
