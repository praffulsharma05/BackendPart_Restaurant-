const mysql = require('mysql2/promise');

async function updateTandooriButterRotiImage() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Pr@fful_213',
    database: 'Restaurant',
  });

  const conn = await pool.getConnection();
  console.log('✅ Connected to MySQL');

  try {
    const imageUrl = 'https://www.allrecipes.com/thmb/qgfQljqLcHe4Zr_SMWzsB2Gd6E8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-85469-indian-chapati-bread-DDMFS-4x3-d2692c11f56b4546b35dccd42ace1958.jpg';

    const [result] = await conn.query(
      "UPDATE menu_items SET image_url = ? WHERE name = 'Tandoori Butter Roti'",
      [imageUrl]
    );
    console.log(`✅ Updated image for Tandoori Butter Roti! (${result.affectedRows} row affected)`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

updateTandooriButterRotiImage();
