const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  const imagePath = 'C:\\Users\\praff\\.gemini\\antigravity-ide\\brain\\f1238e98-947f-412e-86cc-0f6be491dc06\\media__1786089211023.png';
  let qrBase64 = '';
  if (fs.existsSync(imagePath)) {
    const buffer = fs.readFileSync(imagePath);
    qrBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pr@fful_213',
    database: process.env.DB_NAME || 'Restaurant',
  });

  try {
    // Alter column to LONGTEXT if needed
    try {
      await pool.query('ALTER TABLE restaurant_info MODIFY COLUMN qr_payment_image_url LONGTEXT');
    } catch (_e) {}

    const [rows] = await pool.query('SELECT id FROM restaurant_info LIMIT 1');
    if (rows.length > 0) {
      const restId = rows[0].id;
      await pool.query(
        `UPDATE restaurant_info 
         SET upi_id = ?, phone = ?, qr_payment_image_url = COALESCE(NULLIF(?, ''), qr_payment_image_url) 
         WHERE id = ?`,
        ['7878606937@ibl', '+917878606937', qrBase64, restId]
      );
      console.log('✅ Successfully updated restaurant_info table with UPI ID 7878606937@ibl, Phone +917878606937, and PhonePe QR Code image!');
    }

    // Also update users table for admin phone
    await pool.query(
      `UPDATE users SET phone = '+917878606937' WHERE role = 'ADMIN' OR email = 'praffulsharma38@gmail.com'`
    );
    console.log('✅ Successfully updated admin user phone number to +917878606937 in users table!');

  } catch (err) {
    console.error('❌ Error updating DB:', err.message);
  } finally {
    await pool.end();
  }
}

updateDatabase();
