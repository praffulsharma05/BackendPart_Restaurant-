import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function query() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    console.error('❌ Database Configuration Error: Missing required environment variables (DB_HOST, DB_USER, DB_NAME) in .env');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: host,
    port: Number(process.env.DB_PORT) || 3306,
    user: user,
    password: password || '',
    database: database,
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
