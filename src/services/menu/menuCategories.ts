import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export async function ensureCategoriesInDb() {
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT name FROM menu_categories');
    const existingNames = rows.map((r) => (r.name || '').toLowerCase().trim());

    if (!existingNames.some((n) => n.includes('starter'))) {
      await dbPool.query(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE name=name',
        ['Starters', 'Appetizers & Starters', 1]
      );
    }
    if (!existingNames.some((n) => n.includes('main'))) {
      await dbPool.query(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE name=name',
        ['Main Course', 'Main Courses & Gravies', 2]
      );
    }
  } catch (_err) {
    // Ignore schema error if table exists with different primary key
  }
}

export async function getCategories() {
  await ensureCategoriesInDb();

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_categories WHERE is_active = TRUE ORDER BY display_order ASC');
  const allowedKeywords = ['starter', 'starters', 'main', 'mains', 'main course'];

  const filtered = rows.filter((r: any) => {
    const nameLower = (r.name || '').toLowerCase().trim();
    return allowedKeywords.some((kw) => nameLower.includes(kw));
  });

  return filtered;
}
