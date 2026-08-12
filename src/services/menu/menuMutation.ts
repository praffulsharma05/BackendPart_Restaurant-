import { dbPool } from '../../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { InventoryStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { ensureColumnsExist, getMenuItemById } from './menuQuery';
import { DEFAULTS } from '../../constants';

export async function createMenuItem(data: any) {
  await ensureColumnsExist();
  const id = `m_${Date.now()}`;
  const { name, description, price, category, prepTimeMinutes = DEFAULTS.PREP_TIME_MINUTES, ingredients = [], options = [], rating = DEFAULTS.RATING, spiceLevel = DEFAULTS.SPICE_LEVEL, spice_level } = data;
  const spice = spiceLevel || spice_level || DEFAULTS.SPICE_LEVEL;
  
  const imageUrl = data.imageUrl || data.image || '';
  const isVegetarian = data.isVegetarian !== undefined ? data.isVegetarian : (data.isVeg !== undefined ? data.isVeg : false);

  const [cats] = await dbPool.query<RowDataPacket[]>('SELECT id FROM menu_categories WHERE name = ? LIMIT 1', [category]);
  const categoryId = cats.length > 0 ? cats[0].id : 1;

  await dbPool.query(
    `INSERT INTO menu_items (id, category_id, name, description, price, category, image_url, is_vegetarian, is_hidden, inventory_status, prep_time_minutes, rating, spice_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?)`,
    [id, categoryId, name, description, price, category, imageUrl, isVegetarian ? 1 : 0, DEFAULTS.INVENTORY_STATUS, Number(prepTimeMinutes) || DEFAULTS.PREP_TIME_MINUTES, Number(rating) || DEFAULTS.RATING, spice]
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

  return getMenuItemById(id);
}

export async function updateMenuItem(id: string, data: any) {
  await ensureColumnsExist();
  const { name, description, price, category, isHidden, inventoryStatus, prepTimeMinutes, rating, spiceLevel, spice_level } = data;
  const spice = spiceLevel || spice_level;
  
  const imageUrl = data.imageUrl !== undefined ? data.imageUrl : data.image;
  const isVegetarian = data.isVegetarian !== undefined ? data.isVegetarian : data.isVeg;

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
      prep_time_minutes = COALESCE(?, prep_time_minutes),
      rating = COALESCE(?, rating),
      spice_level = COALESCE(?, spice_level)
     WHERE id = ?`,
    [name, description, price, category, imageUrl, isVegetarian !== undefined ? (isVegetarian ? 1 : 0) : null, isHidden, inventoryStatus, prepTimeMinutes ? Number(prepTimeMinutes) : null, rating !== undefined ? Number(rating) : null, spice !== undefined ? spice : null, id]
  );

  return getMenuItemById(id);
}

export async function updateInventoryStatus(id: string, status: InventoryStatus) {
  await dbPool.query('UPDATE menu_items SET inventory_status = ? WHERE id = ?', [status, id]);
  return getMenuItemById(id);
}

export async function toggleHideMenuItem(id: string, isHidden: boolean) {
  await dbPool.query('UPDATE menu_items SET is_hidden = ? WHERE id = ?', [isHidden, id]);
  return getMenuItemById(id);
}

export async function deleteMenuItem(id: string) {
  await ensureColumnsExist();
  const [result] = await dbPool.query<ResultSetHeader>('UPDATE menu_items SET is_deleted = TRUE WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function restoreMenuItem(id: string) {
  await ensureColumnsExist();
  const [result] = await dbPool.query<ResultSetHeader>('UPDATE menu_items SET is_deleted = FALSE WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function permanentDeleteMenuItem(id: string) {
  const [result] = await dbPool.query<ResultSetHeader>('DELETE FROM menu_items WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function addCustomizationOption(menuItemId: string, data: { name: string; price: number }) {
  const optId = uuidv4();
  await dbPool.query('INSERT INTO customization_options (id, menu_item_id, name, price) VALUES (?, ?, ?, ?)', [
    optId,
    menuItemId,
    data.name,
    data.price,
  ]);
  return { id: optId, name: data.name, price: data.price };
}

export async function updateCustomizationOption(menuItemId: string, customizationId: string, data: { name: string; price: number }) {
  await dbPool.query('UPDATE customization_options SET name = ?, price = ? WHERE id = ? AND menu_item_id = ?', [
    data.name,
    data.price,
    customizationId,
    menuItemId,
  ]);
  return { id: customizationId, name: data.name, price: data.price };
}

export async function deleteCustomizationOption(menuItemId: string, customizationId: string) {
  const [result] = await dbPool.query<ResultSetHeader>(
    'UPDATE customization_options SET is_deleted = TRUE WHERE id = ? AND menu_item_id = ?',
    [customizationId, menuItemId]
  );
  return result.affectedRows > 0;
}

export async function addMasterCustomization(name: string, price: number) {
  await ensureColumnsExist();
  const id = uuidv4();
  await dbPool.query('INSERT INTO master_customizations (id, name, price) VALUES (?, ?, ?)', [
    id,
    name,
    Number(price) || 0,
  ]);
  return { id, name, price: Number(price) || 0 };
}

export async function updateMasterCustomization(id: string, name: string, price: number) {
  await ensureColumnsExist();
  await dbPool.query('UPDATE master_customizations SET name = ?, price = ? WHERE id = ?', [
    name,
    Number(price) || 0,
    id,
  ]);
  return { id, name, price: Number(price) || 0 };
}

export async function deleteMasterCustomization(id: string) {
  await ensureColumnsExist();
  const [result] = await dbPool.query<ResultSetHeader>(
    'UPDATE master_customizations SET is_deleted = TRUE WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
