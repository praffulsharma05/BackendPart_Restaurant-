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


  } catch (_err) {
    // Ignore schema error if table exists with different primary key
  }
}

export async function getCategories() {
  await ensureCategoriesInDb();

  const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM menu_categories WHERE is_active = TRUE ORDER BY display_order ASC');
  return rows;
}
