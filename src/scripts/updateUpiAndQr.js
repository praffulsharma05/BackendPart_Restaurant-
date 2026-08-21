const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const path = require('path');

async function updateDatabase() {
  const imagePath = process.env.QR_CODE_IMAGE_PATH
    ? path.resolve(__dirname, '../../', process.env.QR_CODE_IMAGE_PATH)
    : path.resolve(__dirname, '../../public/images/upi_qr_code.png');

  let qrBase64 = '';
  if (fs.existsSync(imagePath)) {
    const buffer = fs.readFileSync(imagePath);
    qrBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'Restaurant',
  });

  const upiId = process.env.ADMIN_UPI_ID;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!upiId || !adminEmail || !adminPhone) {
    console.error('❌ Error: ADMIN_UPI_ID, ADMIN_EMAIL, and ADMIN_PHONE must be set in .env');
    return;
  }

  try {
    try {
      await pool.query('ALTER TABLE restaurant_info MODIFY COLUMN qr_payment_image_url LONGTEXT');
    } catch (_e) {}

    const [rows] = await pool.query('SELECT id FROM restaurant_info LIMIT 1');
    if (rows.length > 0) {
      const restId = rows[0].id;
      await pool.query(
        `UPDATE restaurant_info 
         SET upi_id = ?, qr_payment_image_url = COALESCE(NULLIF(?, ''), qr_payment_image_url) 
         WHERE id = ?`,
        [upiId, qrBase64 || null, restId]
      );
      console.log(`✅ Successfully updated restaurant_info table with UPI ID ${upiId}!`);
    }

    try {
      await pool.query(
        `UPDATE restaurants SET upi_id = ?, qr_payment_image_url = COALESCE(NULLIF(?, ''), qr_payment_image_url)`,
        [upiId, qrBase64 || null]
      );
      console.log(`✅ Successfully updated restaurants table with UPI ID ${upiId}!`);
    } catch (_e) {}

    // Also update users table for admin email and phone from env variables
    try {
      await pool.query(
        `UPDATE users SET email = ?, phone = ? WHERE role = 'ADMIN'`,
        [adminEmail, adminPhone]
      );
    } catch (_e) {
      await pool.query(
        `UPDATE users SET phone = ? WHERE email = ?`,
        [adminPhone, adminEmail]
      );
    }
    console.log(`✅ Successfully updated admin user email (${adminEmail}) and phone (${adminPhone}) from environment!`);

  } catch (err) {
    console.error('❌ Error updating DB:', err.message);
  } finally {
    await pool.end();
  }
}

updateDatabase();

