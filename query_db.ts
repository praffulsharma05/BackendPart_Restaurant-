import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function query() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Restaurant',
  });

  try {
    const [categories] = await connection.query('SELECT * FROM menu_categories');
    console.log('Categories:');
    console.table(categories);

    const [itemCounts] = await connection.query('SELECT category, COUNT(*) as count FROM menu_items GROUP BY category');
    console.log('Item Counts by Category:');
    console.table(itemCounts);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

query();
