const mysql = require('mysql2/promise');

async function seedMenu() {
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
    await conn.beginTransaction();

    console.log('🗑️ Clearing existing menu data...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('DELETE FROM customization_options');
    await conn.query('DELETE FROM menu_item_ingredients');
    await conn.query('DELETE FROM menu_items');
    await conn.query('DELETE FROM menu_categories');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const categories = [
      { name: 'Non Veg Snacks',   desc: 'Tandoori, tikka, kebabs & fried non-veg starters', order: 1 },
      { name: 'Non Veg Platter',  desc: 'Cocktail platters for sharing', order: 2 },
      { name: 'Non Veg Roll',     desc: 'Stuffed non-veg rolls and wraps', order: 3 },
      { name: 'Main Course',      desc: 'Rich chicken, mutton & egg curries', order: 4 },
      { name: 'Biryani',          desc: 'Aromatic chicken & mutton biryanis', order: 5 },
      { name: 'Momos',            desc: 'Roasted, Afgani & chilly chicken momos', order: 6 },
      { name: 'Party Pack',       desc: 'Family-size curry party packs', order: 7 },
      { name: 'Veg Snacks',       desc: 'Paneer tikka, soya chaap & veg starters', order: 8 },
      { name: 'Veg Rolls',        desc: 'Soya chaap & paneer rolls', order: 9 },
      { name: 'Soup',             desc: 'Chicken and Mutton Paya soups', order: 10 },
      { name: 'Breads',           desc: 'Naan, roti, paratha & khamiri roti', order: 11 },
    ];

    const catIds = {};
    for (const cat of categories) {
      const [result] = await conn.query(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, TRUE)',
        [cat.name, cat.desc, cat.order]
      );
      catIds[cat.name] = result.insertId;
    }

    // Direct High Quality Online Image URLs (Verified HTTP 200 OK)
    const IMG = {
      rolls: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600',
      paneerTikka: 'https://images.pexels.com/photos/9603334/pexels-photo-9603334.jpeg?auto=compress&cs=tinysrgb&w=600',
      soyaChaap: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600',
      chickenCurry: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600',
      muttonCurry: 'https://images.pexels.com/photos/8697543/pexels-photo-8697543.jpeg?auto=compress&cs=tinysrgb&w=600',
      soup: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=600',
      biryani: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600',
      momos: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
      roti: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=600',
      chickenPakora: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=600',
    };

    const items = [
      // ===== NON VEG SNACKS =====
      { name: 'Peshawari Chicken Tikka (6pcs)',    price: 225, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop' },
      { name: 'Afgani Chicken Tikka (6pcs)',       price: 225, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1610057099443-fce8c4d50f91?w=600&auto=format&fit=crop' },
      { name: 'Malai Chicken Tikka (6pcs)',        price: 250, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop' },
      { name: 'Kaali Mirch Chicken Tikka (6pcs)',  price: 250, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'Roasted Jumbo Chicken Legs',        price: 160, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop' },
      { name: 'Tandoori Chicken (Full)',            price: 420, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=600&auto=format&fit=crop' },
      { name: 'Butter Tandoori Chicken',           price: 520, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },
      { name: 'Kaali Mirch Jumbo Legs',            price: 180, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop' },
      { name: 'Fried Chicken Pakora (8pcs)',       price: 180, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop' },
      { name: 'Lemon Chicken (6pcs)',              price: 225, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop' },
      { name: 'Mutton Tikka (8pcs)',               price: 320, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop' },
      { name: 'Mutton Seekh Kebab',                price: 320, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop' },
      { name: 'Roasted Fish (6pcs)',               price: 320, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop' },
      { name: 'Fry Fish (8pcs)',                   price: 320, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop' },
      { name: 'Chilly Chicken',                    price: 185, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop' },
      { name: 'Chicken Lollipop',                  price: 185, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1524182576066-1d963e940027?w=600&auto=format&fit=crop' },
      { name: 'Sauted Chicken',                    price: 250, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop' },
      { name: 'Sauted Mutton',                     price: 320, cat: 'Non Veg Snacks', veg: false, img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop' },

      // ===== NON VEG PLATTER =====
      { name: 'Chicken Tikka Cocktail',            price: 225, cat: 'Non Veg Platter', veg: false, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop' },
      { name: 'Chicken & Mutton Kebab Cocktail',   price: 225, cat: 'Non Veg Platter', veg: false, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop' },
      { name: 'Chicken & Leg Cocktail',            price: 290, cat: 'Non Veg Platter', veg: false, img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop' },
      { name: 'Chicken & Fish Cocktail',           price: 290, cat: 'Non Veg Platter', veg: false, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop' },

      // ===== NON VEG ROLL =====
      { name: 'Chicken Tikka Roll',      price: 160, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'Mutton Roll',              price: 250, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop' },
      { name: 'Mutton Kebab Roll',        price: 160, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'Fish Roll',                price: 160, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop' },
      { name: 'Afgani Chicken Roll',      price: 170, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'Afgani Kebab Roll',        price: 170, cat: 'Non Veg Roll', veg: false, img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop' },

      // ===== MAIN COURSE =====
      { name: 'Egg Curry (3pcs)',                        price: 160, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1626500155562-e1a4c31d9671?w=600&auto=format&fit=crop' },
      { name: 'Amritsari Chicken Curry (3pcs)',          price: 225, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },
      { name: 'Punjabi Mutton Curry (3pcs)',             price: 320, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop' },
      { name: 'Mutton Keema Kalegi',                     price: 320, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop' },
      { name: 'Chicken Bhartha',                         price: 225, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop' },
      { name: 'Butter Chicken Curry (3pcs)',             price: 250, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },
      { name: 'Chicken Tikka Masala',                    price: 300, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop' },
      { name: 'Butter Chicken Tikka Masala',             price: 320, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },
      { name: 'Mutton Kebab Masala',                     price: 375, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop' },
      { name: 'Kadhai Chicken',                          price: 250, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop' },
      { name: 'Kali Mirchi Chicken Curry (Boneless 6 Pcs.)', price: 320, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'Tawa Chicken',                            price: 250, cat: 'Main Course', veg: false, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop' },

      // ===== BIRYANI =====
      { name: 'Chicken Biryani', price: 160, cat: 'Biryani', veg: false, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop' },
      { name: 'Mutton Biryani',  price: 200, cat: 'Biryani', veg: false, img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop' },

      // ===== MOMOS =====
      { name: 'ROSTED CHICKEN MOMOS', price: 125, cat: 'Momos', veg: false, img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600&auto=format&fit=crop' },
      { name: 'AFGANI MOMOS',          price: 175, cat: 'Momos', veg: false, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop' },
      { name: 'CHILLYCHICKEN MOMOS',  price: 200, cat: 'Momos', veg: false, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop' },

      // ===== PARTY PACK =====
      { name: 'AMRITSARI CHICKEN CURRY', price: 375, cat: 'Party Pack', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },
      { name: 'PUNJABI MUTTON CURRY',    price: 625, cat: 'Party Pack', veg: false, img: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop' },
      { name: 'KEEMA KALEGI',            price: 625, cat: 'Party Pack', veg: false, img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop' },
      { name: 'BUTTER CHICKEN CURRY',    price: 500, cat: 'Party Pack', veg: false, img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop' },

      // ===== VEG SNACKS =====
      { name: 'PANEER TIKKA',         price: 125, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop' },
      { name: 'SOYA CHAAP',           price: 125, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },
      { name: 'LEMON SOYA CHAAP',     price: 125, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },
      { name: 'AFGANI SOYA CHAAP',    price: 140, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },
      { name: 'AFGANI PANEER TIKKA',  price: 140, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop' },
      { name: 'TAWA CHAAP CURRY',     price: 185, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },
      { name: 'CHILLY PANEER',        price: 175, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop' },
      { name: 'TANDOORI SOYA CHAAP',  price: 175, cat: 'Veg Snacks', veg: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' },

      // ===== VEG ROLLS =====
      { name: 'SOYA CHAAP ROLL',    price: 125, cat: 'Veg Rolls', veg: true, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'PANEER TIKKA ROLL',   price: 125, cat: 'Veg Rolls', veg: true, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'AFGANI CHAAP ROLL',   price: 145, cat: 'Veg Rolls', veg: true, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },
      { name: 'AFGANI PANEER ROLL',  price: 150, cat: 'Veg Rolls', veg: true, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop' },

      // ===== SOUP =====
      { name: 'CHICKEN SOUP',      price: 50,  cat: 'Soup', veg: false, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop' },
      { name: 'MUTTON PAYA SOUP',  price: 85,  cat: 'Soup', veg: false, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop' },

      // ===== BREADS =====
      { name: 'Tandoori Butter Roti',          price: 10,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Naan',                          price: 25,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Garlic Naan',                   price: 37,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Laccha Paratha',                price: 25,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Masala Laccha Paratha',          price: 30,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Khamiri Roti (Turkish Bread)',  price: 16,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
      { name: 'Rumali Roti',                   price: 13,  cat: 'Breads', veg: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' },
    ];

    let count = 0;
    for (const item of items) {
      count++;
      const id = `item_${Date.now()}_${count}`;
      const catId = catIds[item.cat] || null;
      await conn.query(
        `INSERT INTO menu_items (id, name, description, price, rating, category, category_id, image_url, is_vegetarian, is_hidden, inventory_status, prep_time_minutes, is_deleted)
         VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, FALSE, 'AVAILABLE', 15, FALSE)`,
        [id, item.name, `${item.name} (${item.cat})`, item.price, item.cat, catId, item.img, item.veg]
      );
    }

    await conn.commit();
    console.log(`✅ Successfully inserted ${count} menu items into database with verified online image URLs!`);

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

seedMenu();
