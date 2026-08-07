const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdminUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pr@fful_213',
    database: process.env.DB_NAME || 'Restaurant',
  });

  try {
    await pool.query(
      `UPDATE users SET phone = '+917878606937' WHERE email = 'praffulsharma38@gmail.com'`
    );
    console.log('✅ Admin user phone updated successfully to +917878606937!');
  } catch (err) {
    console.error('Info:', err.message);
  } finally {
    await pool.end();
  }
}

updateAdminUser();
