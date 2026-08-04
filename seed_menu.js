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

    // 1. Delete all existing menu data
    console.log('🗑️  Clearing existing menu data...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('DELETE FROM customization_options');
    await conn.query('DELETE FROM menu_item_ingredients');
    await conn.query('DELETE FROM menu_items');
    await conn.query('DELETE FROM menu_categories');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ All existing menu data cleared');

    // 2. Insert categories with proper display order
    console.log('📁 Inserting categories...');
    const categories = [
      { name: 'Non Veg Snacks',   desc: 'Tandoori, tikka, kebabs & fried delights', order: 1 },
      { name: 'Non Veg Platter',  desc: 'Cocktail platters for sharing', order: 2 },
      { name: 'Non Veg Roll',     desc: 'Stuffed rolls and wraps', order: 3 },
      { name: 'Main Course',      desc: 'Rich curries and gravies', order: 4 },
      { name: 'Biryani',          desc: 'Aromatic rice dishes', order: 5 },
      { name: 'Momos',            desc: 'Steamed and fried dumplings', order: 6 },
      { name: 'Party Pack',       desc: 'Family-size party packs', order: 7 },
      { name: 'Veg Snacks',       desc: 'Paneer, soya chaap & veg starters', order: 8 },
      { name: 'Veg Rolls',        desc: 'Vegetarian rolls and wraps', order: 9 },
      { name: 'Soup',             desc: 'Warm soups', order: 10 },
      { name: 'Breads',           desc: 'Naan, roti, paratha & kulcha', order: 11 },
    ];

    const catIds = {};
    for (const cat of categories) {
      const [result] = await conn.query(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, TRUE)',
        [cat.name, cat.desc, cat.order]
      );
      catIds[cat.name] = result.insertId;
    }
    console.log('✅ Categories inserted:', Object.keys(catIds).join(', '));

    // 3. Insert all menu items
    console.log('🍽️  Inserting menu items...');

    // Image URLs mapped by food type for relevant images
    const IMG = {
      chickenTikka:   'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
      tandoori:       'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
      friedChicken:   'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
      kebab:          'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
      fishFry:        'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
      lollipop:       'https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',
      sautedChicken:  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
      platter:        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      roll:           'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
      eggCurry:       'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
      butterChicken:  'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      muttonCurry:    'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
      tikkamasala:    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      kadhaiChicken:  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      biryani:        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      momos:          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      partyPack:      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      paneerTikka:    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
      soyaChaap:      'https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=600&q=80',
      chillyPaneer:   'https://images.unsplash.com/photo-1631452180775-d7eb3a1e9ecf?auto=format&fit=crop&w=600&q=80',
      vegRoll:        'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
      soup:           'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      naan:           'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      roti:           'https://www.allrecipes.com/thmb/qgfQljqLcHe4Zr_SMWzsB2Gd6E8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-85469-indian-chapati-bread-DDMFS-4x3-d2692c11f56b4546b35dccd42ace1958.jpg',
      garlicNaan:     'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      paratha:        'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
      rumali:         'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
      keema:          'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?auto=format&fit=crop&w=600&q=80',
      tawa:           'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80',
    };

    // All menu items from physical menu card
    const items = [
      // ===== NON VEG SNACKS =====
      { id: 'm_nvs_1',  name: 'Peshawari Chicken Tikka (6pcs)',    price: 225, cat: 'Non Veg Snacks', img: IMG.chickenTikka,  veg: false, rating: 4.5, desc: 'Juicy chicken tikka marinated in Peshawari spices, charcoal grilled to perfection', prep: 20 },
      { id: 'm_nvs_2',  name: 'Afgani Chicken Tikka (6pcs)',       price: 225, cat: 'Non Veg Snacks', img: IMG.chickenTikka,  veg: false, rating: 4.4, desc: 'Creamy Afgani-style chicken tikka with cashew and cream marinade', prep: 20 },
      { id: 'm_nvs_3',  name: 'Malai Chicken Tikka (6pcs)',        price: 250, cat: 'Non Veg Snacks', img: IMG.chickenTikka,  veg: false, rating: 4.6, desc: 'Soft and creamy malai chicken tikka with a rich, buttery flavor', prep: 20 },
      { id: 'm_nvs_4',  name: 'Kaali Mirch Chicken Tikka (6pcs)',  price: 250, cat: 'Non Veg Snacks', img: IMG.chickenTikka,  veg: false, rating: 4.3, desc: 'Bold black pepper chicken tikka with a spicy kick', prep: 20 },
      { id: 'm_nvs_5',  name: 'Roasted Jumbo Chicken Legs',        price: 160, cat: 'Non Veg Snacks', img: IMG.tandoori,      veg: false, rating: 4.2, desc: 'Jumbo chicken legs roasted with Indian spices until crispy', prep: 25 },
      { id: 'm_nvs_6',  name: 'Tandoori Chicken (Full)',            price: 420, cat: 'Non Veg Snacks', img: IMG.tandoori,      veg: false, rating: 4.7, desc: 'Full tandoori chicken, slow-cooked in clay oven with yogurt marinade', prep: 30 },
      { id: 'm_nvs_7',  name: 'Butter Tandoori Chicken',           price: 520, cat: 'Non Veg Snacks', img: IMG.tandoori,      veg: false, rating: 4.8, desc: 'Premium butter-basted tandoori chicken, extra juicy and flavorful', prep: 30 },
      { id: 'm_nvs_8',  name: 'Kaali Mirch Jumbo Legs',            price: 180, cat: 'Non Veg Snacks', img: IMG.tandoori,      veg: false, rating: 4.3, desc: 'Jumbo chicken legs with bold black pepper seasoning', prep: 25 },
      { id: 'm_nvs_9',  name: 'Fried Chicken Pakora (8pcs)',       price: 185, cat: 'Non Veg Snacks', img: IMG.friedChicken,  veg: false, rating: 4.1, desc: 'Crispy fried chicken pakoras, perfect as a tea-time snack', prep: 15 },
      { id: 'm_nvs_10', name: 'Lemon Chicken (6pcs)',              price: 225, cat: 'Non Veg Snacks', img: IMG.sautedChicken, veg: false, rating: 4.4, desc: 'Tangy lemon-marinated chicken pieces, grilled to perfection', prep: 20 },
      { id: 'm_nvs_11', name: 'Mutton Tikka (8pcs)',               price: 225, cat: 'Non Veg Snacks', img: IMG.kebab,         veg: false, rating: 4.5, desc: 'Tender mutton tikka marinated in aromatic spices', prep: 25 },
      { id: 'm_nvs_12', name: 'Mutton Seekh Kebab',                price: 320, cat: 'Non Veg Snacks', img: IMG.kebab,         veg: false, rating: 4.6, desc: 'Minced mutton seekh kebabs grilled on skewers with fresh herbs', prep: 25 },
      { id: 'm_nvs_13', name: 'Roasted Fish (6pcs)',               price: 320, cat: 'Non Veg Snacks', img: IMG.fishFry,       veg: false, rating: 4.3, desc: 'Fresh fish fillets roasted with Indian spices and lemon', prep: 20 },
      { id: 'm_nvs_14', name: 'Fry Fish (8pcs)',                   price: 320, cat: 'Non Veg Snacks', img: IMG.fishFry,       veg: false, rating: 4.2, desc: 'Crispy deep-fried fish pieces with masala coating', prep: 15 },
      { id: 'm_nvs_15', name: 'Chilly Chicken',                    price: 185, cat: 'Non Veg Snacks', img: IMG.sautedChicken, veg: false, rating: 4.4, desc: 'Indo-Chinese style chilly chicken tossed with bell peppers', prep: 15 },
      { id: 'm_nvs_16', name: 'Chicken Lollipop',                  price: 185, cat: 'Non Veg Snacks', img: IMG.lollipop,      veg: false, rating: 4.5, desc: 'Crispy chicken lollipops with spicy glaze', prep: 15 },
      { id: 'm_nvs_17', name: 'Sauted Chicken',                    price: 250, cat: 'Non Veg Snacks', img: IMG.sautedChicken, veg: false, rating: 4.3, desc: 'Pan-sautéd chicken with onions, peppers and Indian spices', prep: 15 },
      { id: 'm_nvs_18', name: 'Sauted Mutton',                     price: 320, cat: 'Non Veg Snacks', img: IMG.kebab,         veg: false, rating: 4.4, desc: 'Tender mutton pieces sautéd with aromatic spices', prep: 20 },

      // ===== NON VEG PLATTER =====
      { id: 'm_nvp_1', name: 'Chicken Tikka Cocktail',             price: 225, cat: 'Non Veg Platter', img: IMG.platter,  veg: false, rating: 4.5, desc: 'Assorted chicken tikka cocktail platter', prep: 20 },
      { id: 'm_nvp_2', name: 'Chicken & Mutton Kebab Cocktail',    price: 225, cat: 'Non Veg Platter', img: IMG.platter,  veg: false, rating: 4.6, desc: 'Mixed chicken and mutton kebab platter for sharing', prep: 25 },
      { id: 'm_nvp_3', name: 'Chicken & Leg Cocktail',             price: 290, cat: 'Non Veg Platter', img: IMG.platter,  veg: false, rating: 4.4, desc: 'Chicken tikka and roasted leg combo platter', prep: 25 },
      { id: 'm_nvp_4', name: 'Chicken & Fish Cocktail',            price: 290, cat: 'Non Veg Platter', img: IMG.platter,  veg: false, rating: 4.5, desc: 'Chicken tikka and crispy fish combo platter', prep: 25 },

      // ===== NON VEG ROLL =====
      { id: 'm_nvr_1', name: 'Chicken Tikka Roll',       price: 160, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.3, desc: 'Juicy chicken tikka wrapped in fresh paratha with chutney', prep: 10 },
      { id: 'm_nvr_2', name: 'Mutton Roll',               price: 250, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.4, desc: 'Tender mutton pieces wrapped in soft paratha', prep: 12 },
      { id: 'm_nvr_3', name: 'Mutton Kebab Roll',         price: 210, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.5, desc: 'Seekh kebab roll with mint chutney and onions', prep: 12 },
      { id: 'm_nvr_4', name: 'Fish Roll',                 price: 260, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.2, desc: 'Crispy fried fish wrapped in paratha with tartar sauce', prep: 12 },
      { id: 'm_nvr_5', name: 'Afgani Chicken Roll',       price: 280, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.4, desc: 'Creamy Afgani chicken tikka wrapped in butter paratha', prep: 12 },
      { id: 'm_nvr_6', name: 'Afgani Kebab Roll',         price: 280, cat: 'Non Veg Roll', img: IMG.roll, veg: false, rating: 4.5, desc: 'Afgani-style seekh kebab roll with cream and herbs', prep: 12 },

      // ===== MAIN COURSE =====
      { id: 'm_mc_1',  name: 'Egg Curry (3pcs)',                         price: 160, cat: 'Main Course', img: IMG.eggCurry,      veg: false, rating: 4.1, desc: 'Classic egg curry in rich tomato-onion gravy', prep: 20 },
      { id: 'm_mc_2',  name: 'Amritsari Chicken Curry (3pcs)',           price: 225, cat: 'Main Course', img: IMG.butterChicken,  veg: false, rating: 4.5, desc: 'Authentic Amritsari-style chicken curry with bold spices', prep: 25 },
      { id: 'm_mc_3',  name: 'Punjabi Mutton Curry (3pcs)',              price: 320, cat: 'Main Course', img: IMG.muttonCurry,    veg: false, rating: 4.7, desc: 'Slow-cooked Punjabi mutton curry with aromatic masala', prep: 35 },
      { id: 'm_mc_4',  name: 'Mutton Keema Kalegi',                      price: 320, cat: 'Main Course', img: IMG.keema,          veg: false, rating: 4.5, desc: 'Minced mutton keema with liver, cooked with traditional spices', prep: 25 },
      { id: 'm_mc_5',  name: 'Chicken Bhartha',                          price: 225, cat: 'Main Course', img: IMG.butterChicken,  veg: false, rating: 4.3, desc: 'Smoky charcoal-roasted chicken mashed with spices', prep: 25 },
      { id: 'm_mc_6',  name: 'Butter Chicken Curry (3pcs)',              price: 250, cat: 'Main Course', img: IMG.butterChicken,  veg: false, rating: 4.8, desc: 'Creamy butter chicken in rich tomato-cashew gravy', prep: 25 },
      { id: 'm_mc_7',  name: 'Chicken Tikka Masala',                     price: 300, cat: 'Main Course', img: IMG.tikkamasala,    veg: false, rating: 4.6, desc: 'Grilled chicken tikka in spiced masala curry', prep: 25 },
      { id: 'm_mc_8',  name: 'Butter Chicken Tikka Masala',              price: 320, cat: 'Main Course', img: IMG.tikkamasala,    veg: false, rating: 4.7, desc: 'Premium butter chicken tikka in creamy masala sauce', prep: 25 },
      { id: 'm_mc_9',  name: 'Mutton Kebab Masala',                      price: 375, cat: 'Main Course', img: IMG.muttonCurry,    veg: false, rating: 4.6, desc: 'Seekh kebab pieces simmered in rich masala gravy', prep: 30 },
      { id: 'm_mc_10', name: 'Kadhai Chicken',                           price: 250, cat: 'Main Course', img: IMG.kadhaiChicken,  veg: false, rating: 4.5, desc: 'Kadhai-style chicken with bell peppers and tomatoes', prep: 20 },
      { id: 'm_mc_11', name: 'Kali Mirchi Chicken Curry (Boneless 6 Pcs.)', price: 320, cat: 'Main Course', img: IMG.butterChicken, veg: false, rating: 4.4, desc: 'Spicy black pepper boneless chicken curry', prep: 25 },
      { id: 'm_mc_12', name: 'Tawa Chicken',                             price: 225, cat: 'Main Course', img: IMG.tawa,           veg: false, rating: 4.3, desc: 'Tawa-fried chicken with onions, peppers and Indian spices', prep: 20 },

      // ===== BIRYANI =====
      { id: 'm_bir_1', name: 'Chicken Biryani', price: 160, cat: 'Biryani', img: IMG.biryani, veg: false, rating: 4.6, desc: 'Fragrant basmati rice layered with spiced chicken and saffron', prep: 30 },
      { id: 'm_bir_2', name: 'Mutton Biryani',  price: 200, cat: 'Biryani', img: IMG.biryani, veg: false, rating: 4.7, desc: 'Aromatic mutton biryani with tender meat and whole spices', prep: 40 },

      // ===== MOMOS =====
      { id: 'm_mom_1', name: 'Roasted Chicken Momos', price: 125, cat: 'Momos', img: IMG.momos, veg: false, rating: 4.3, desc: 'Pan-roasted chicken momos with spicy red chutney', prep: 15 },
      { id: 'm_mom_2', name: 'Afgani Momos',          price: 175, cat: 'Momos', img: IMG.momos, veg: false, rating: 4.4, desc: 'Creamy Afgani-style momos with cashew cream sauce', prep: 15 },
      { id: 'm_mom_3', name: 'Chilly Chicken Momos',  price: 200, cat: 'Momos', img: IMG.momos, veg: false, rating: 4.5, desc: 'Spicy chilly chicken momos tossed in Indo-Chinese sauce', prep: 15 },

      // ===== PARTY PACK =====
      { id: 'm_pp_1', name: 'Amritsari Chicken Curry (Party Pack)', price: 625, cat: 'Party Pack', img: IMG.partyPack,    veg: false, rating: 4.5, desc: 'Family-size Amritsari chicken curry, serves 4-6', prep: 35 },
      { id: 'm_pp_2', name: 'Punjabi Mutton Curry (Party Pack)',    price: 625, cat: 'Party Pack', img: IMG.partyPack,    veg: false, rating: 4.6, desc: 'Family-size Punjabi mutton curry, serves 4-6', prep: 40 },
      { id: 'm_pp_3', name: 'Keema Kalegi (Party Pack)',            price: 1250, cat: 'Party Pack', img: IMG.partyPack,   veg: false, rating: 4.5, desc: 'Family-size keema kalegi, serves 6-8', prep: 35 },
      { id: 'm_pp_4', name: 'Butter Chicken Curry (Party Pack)',    price: 875, cat: 'Party Pack', img: IMG.partyPack,    veg: false, rating: 4.7, desc: 'Family-size butter chicken curry, serves 4-6', prep: 35 },

      // ===== VEG SNACKS =====
      { id: 'm_vsnack_1', name: 'Paneer Tikka',         price: 125, cat: 'Veg Snacks', img: IMG.paneerTikka, veg: true, rating: 4.4, desc: 'Cottage cheese tikka marinated in spices, charcoal grilled', prep: 15 },
      { id: 'm_vsnack_2', name: 'Soya Chaap',           price: 125, cat: 'Veg Snacks', img: IMG.soyaChaap,   veg: true, rating: 4.3, desc: 'Grilled soya chaap with tandoori marinade', prep: 15 },
      { id: 'm_vsnack_3', name: 'Lemon Soya Chaap',     price: 125, cat: 'Veg Snacks', img: IMG.soyaChaap,   veg: true, rating: 4.2, desc: 'Tangy lemon-marinated soya chaap, grilled fresh', prep: 15 },
      { id: 'm_vsnack_4', name: 'Afgani Soya Chaap',    price: 140, cat: 'Veg Snacks', img: IMG.soyaChaap,   veg: true, rating: 4.4, desc: 'Creamy Afgani-style soya chaap with cashew marinade', prep: 15 },
      { id: 'm_vsnack_5', name: 'Afgani Paneer Tikka',  price: 140, cat: 'Veg Snacks', img: IMG.paneerTikka, veg: true, rating: 4.5, desc: 'Afgani paneer tikka with cream and cashew coating', prep: 15 },
      { id: 'm_vsnack_6', name: 'Tawa Chaap Curry',     price: 185, cat: 'Veg Snacks', img: IMG.soyaChaap,   veg: true, rating: 4.3, desc: 'Tawa-fried soya chaap in spicy curry sauce', prep: 15 },
      { id: 'm_vsnack_7', name: 'Chilly Paneer',        price: 175, cat: 'Veg Snacks', img: IMG.chillyPaneer, veg: true, rating: 4.5, desc: 'Indo-Chinese chilly paneer with bell peppers and onions', prep: 15 },
      { id: 'm_vsnack_8', name: 'Tandoori Soya Chaap',  price: 175, cat: 'Veg Snacks', img: IMG.soyaChaap,   veg: true, rating: 4.3, desc: 'Tandoori soya chaap grilled in clay oven', prep: 15 },

      // ===== VEG ROLLS =====
      { id: 'm_vroll_1', name: 'Soya Chaap Roll',    price: 125, cat: 'Veg Rolls', img: IMG.vegRoll, veg: true, rating: 4.2, desc: 'Grilled soya chaap wrapped in paratha with chutney', prep: 10 },
      { id: 'm_vroll_2', name: 'Paneer Tikka Roll',   price: 125, cat: 'Veg Rolls', img: IMG.vegRoll, veg: true, rating: 4.3, desc: 'Paneer tikka roll with mint chutney and onions', prep: 10 },
      { id: 'm_vroll_3', name: 'Afgani Chaap Roll',   price: 145, cat: 'Veg Rolls', img: IMG.vegRoll, veg: true, rating: 4.4, desc: 'Creamy Afgani chaap wrapped in butter paratha', prep: 10 },
      { id: 'm_vroll_4', name: 'Afgani Paneer Roll',  price: 150, cat: 'Veg Rolls', img: IMG.vegRoll, veg: true, rating: 4.4, desc: 'Afgani paneer tikka roll with cream and herbs', prep: 10 },

      // ===== SOUP =====
      { id: 'm_soup_1', name: 'Chicken Soup',      price: 50,  cat: 'Soup', img: IMG.soup, veg: false, rating: 4.1, desc: 'Hot and comforting chicken soup with herbs', prep: 10 },
      { id: 'm_soup_2', name: 'Mutton Paya Soup',  price: 85,  cat: 'Soup', img: IMG.soup, veg: false, rating: 4.3, desc: 'Traditional slow-cooked mutton paya soup, rich and hearty', prep: 15 },

      // ===== BREADS =====
      { id: 'm_bread_1', name: 'Tandoori Butter Roti',          price: 10,  cat: 'Breads', img: IMG.roti,       veg: true, rating: 4.2, desc: 'Soft tandoori roti brushed with fresh butter', prep: 5 },
      { id: 'm_bread_2', name: 'Naan',                          price: 25,  cat: 'Breads', img: IMG.naan,       veg: true, rating: 4.3, desc: 'Classic soft naan baked in tandoor oven', prep: 5 },
      { id: 'm_bread_3', name: 'Garlic Naan',                   price: 37,  cat: 'Breads', img: IMG.garlicNaan, veg: true, rating: 4.5, desc: 'Fluffy naan topped with garlic and butter', prep: 5 },
      { id: 'm_bread_4', name: 'Laccha Paratha',                price: 25,  cat: 'Breads', img: IMG.paratha,    veg: true, rating: 4.3, desc: 'Layered flaky laccha paratha, crispy and buttery', prep: 8 },
      { id: 'm_bread_5', name: 'Masala Laccha Paratha',          price: 30,  cat: 'Breads', img: IMG.paratha,    veg: true, rating: 4.4, desc: 'Spiced masala laccha paratha with herbs', prep: 8 },
      { id: 'm_bread_6', name: 'Khamiri Roti (Turkish Bread)',  price: 16,  cat: 'Breads', img: IMG.roti,       veg: true, rating: 4.2, desc: 'Traditional khamiri roti, soft and fluffy Turkish-style bread', prep: 8 },
      { id: 'm_bread_7', name: 'Rumali Roti',                   price: 13,  cat: 'Breads', img: IMG.rumali,     veg: true, rating: 4.1, desc: 'Paper-thin rumali roti, delicate and light', prep: 5 },
    ];

    let insertedCount = 0;
    for (const item of items) {
      const catId = catIds[item.cat] || null;
      await conn.query(
        `INSERT INTO menu_items (id, name, description, price, rating, category, category_id, image_url, is_vegetarian, is_hidden, inventory_status, prep_time_minutes, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'AVAILABLE', ?, FALSE)`,
        [item.id, item.name, item.desc, item.price, item.rating, item.cat, catId, item.img, item.veg, item.prep]
      );
      insertedCount++;
    }

    await conn.commit();
    console.log(`✅ Successfully inserted ${insertedCount} menu items across ${categories.length} categories!`);

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

seedMenu();
