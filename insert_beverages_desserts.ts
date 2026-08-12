import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function insertMenu() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Restaurant',
  });

  try {
    // 1. Insert Beverages Category
    let beveragesCategoryId: number;
    const [bevCheck] = await connection.query<any[]>(
      'SELECT id FROM menu_categories WHERE name = ?',
      ['Beverages']
    );

    if (bevCheck.length > 0) {
      beveragesCategoryId = bevCheck[0].id;
      console.log(`Beverages category already exists with ID: ${beveragesCategoryId}`);
    } else {
      const [bevRes] = await connection.query<any>(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, ?)',
        ['Beverages', 'Refreshing cold drinks and soda', 12, true]
      );
      beveragesCategoryId = bevRes.insertId;
      console.log(`Created Beverages category with ID: ${beveragesCategoryId}`);
    }

    // 2. Insert Desserts Category
    let dessertsCategoryId: number;
    const [desCheck] = await connection.query<any[]>(
      'SELECT id FROM menu_categories WHERE name = ?',
      ['Desserts']
    );

    if (desCheck.length > 0) {
      dessertsCategoryId = desCheck[0].id;
      console.log(`Desserts category already exists with ID: ${dessertsCategoryId}`);
    } else {
      const [desRes] = await connection.query<any>(
        'INSERT INTO menu_categories (name, description, display_order, is_active) VALUES (?, ?, ?, ?)',
        ['Desserts', 'Sweet desserts and treats', 13, true]
      );
      dessertsCategoryId = desRes.insertId;
      console.log(`Created Desserts category with ID: ${dessertsCategoryId}`);
    }

    // 3. Add Thums Up under Beverages
    const thumsUpId = 'item_beverages_thumsup';
    const [thumsCheck] = await connection.query<any[]>(
      'SELECT id FROM menu_items WHERE id = ?',
      [thumsUpId]
    );
    if (thumsCheck.length === 0) {
      await connection.query(
        `INSERT INTO menu_items (id, category_id, name, description, price, rating, spice_level, category, image_url, is_vegetarian, is_hidden, inventory_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          thumsUpId,
          beveragesCategoryId,
          'Thums Up',
          'Chilled refreshing Thums Up cold drink (250ml)',
          40.00,
          4.8,
          'none',
          'Beverages',
          'http://localhost:5000/images/thumpups.png',
          true,
          false,
          'AVAILABLE'
        ]
      );
      console.log('Inserted Thums Up into database.');
    } else {
      console.log('Thums Up already exists.');
    }

    // 4. Add Coca Cola under Beverages
    const cocaColaId = 'item_beverages_cocacola';
    const [cocaCheck] = await connection.query<any[]>(
      'SELECT id FROM menu_items WHERE id = ?',
      [cocaColaId]
    );
    if (cocaCheck.length === 0) {
      await connection.query(
        `INSERT INTO menu_items (id, category_id, name, description, price, rating, spice_level, category, image_url, is_vegetarian, is_hidden, inventory_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cocaColaId,
          beveragesCategoryId,
          'Coca Cola',
          'Chilled refreshing Coca Cola cold drink (250ml)',
          40.00,
          4.8,
          'none',
          'Beverages',
          'http://localhost:5000/images/coca_cola.png',
          true,
          false,
          'AVAILABLE'
        ]
      );
      console.log('Inserted Coca Cola into database.');
    } else {
      console.log('Coca Cola already exists.');
    }

    // 5. Add Gulab Jamun under Desserts
    const gulabJamunId = 'item_desserts_gulabjamun';
    const [gulabCheck] = await connection.query<any[]>(
      'SELECT id FROM menu_items WHERE id = ?',
      [gulabJamunId]
    );
    if (gulabCheck.length === 0) {
      await connection.query(
        `INSERT INTO menu_items (id, category_id, name, description, price, rating, spice_level, category, image_url, is_vegetarian, is_hidden, inventory_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gulabJamunId,
          dessertsCategoryId,
          'Gulab Jamun',
          'Two pieces of delicious warm sweet Gulab Jamun dipped in hot sugar syrup',
          40.00,
          4.8,
          'none',
          'Desserts',
          'http://localhost:5000/images/gulab_jamun.png',
          true,
          false,
          'AVAILABLE'
        ]
      );
      console.log('Inserted Gulab Jamun into database.');
    } else {
      console.log('Gulab Jamun already exists.');
    }

  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    await connection.end();
  }
}

insertMenu();
