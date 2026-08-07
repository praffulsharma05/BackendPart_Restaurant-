const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAll() {
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
    try {
      await pool.query('ALTER TABLE restaurants MODIFY COLUMN qr_payment_image_url LONGTEXT');
    } catch (_e) {}

    await pool.query(
      `UPDATE restaurants SET upi_id = ?, phone = ?, qr_payment_image_url = COALESCE(NULLIF(?, ''), qr_payment_image_url)`,
      ['7878606937@ibl', '+917878606937', qrBase64]
    );

    await pool.query(
      `UPDATE restaurant_info SET upi_id = ?, phone = ?, qr_payment_image_url = COALESCE(NULLIF(?, ''), qr_payment_image_url)`,
      ['7878606937@ibl', '+917878606937', qrBase64]
    );

    console.log('✅ Updated all restaurant tables with UPI ID 7878606937@ibl, Phone +917878606937, and PhonePe QR Code image!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateAll();
