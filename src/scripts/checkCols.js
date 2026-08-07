const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkColumns() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pr@fful_213',
    database: process.env.DB_NAME || 'Restaurant',
  });

  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM restaurant_info');
    console.log('Columns in restaurant_info:', cols.map(c => c.Field));
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

checkColumns();
