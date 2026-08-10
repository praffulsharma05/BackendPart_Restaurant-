/**
 * ============================================================================
 * Sample Database Connection & Data Fetching Demo (TypeScript)
 * ============================================================================
 * 
 * This file demonstrates:
 * 1. Connecting to MySQL/MariaDB using `mysql2/promise` with TypeScript interfaces.
 * 2. Creating a connection pool and testing connection.
 * 3. Fetching typed rows using SQL SELECT queries.
 * 4. Executing safe parameterized queries.
 * 5. Safely releasing connections and ending the pool.
 * 
 * How to run:
 *   npx ts-node sample_db_demo.ts
 * ============================================================================
 */

import mysql, { PoolOptions, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Define interfaces for sample table records
interface RestaurantInfoRow extends RowDataPacket {
  id: number;
  name: string;
  tagline: string;
  phone: string;
  email: string;
  is_active: number | boolean;
}

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

async function runSampleDatabaseDemo(): Promise<void> {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting TypeScript DB Connection & Fetch Demo...');
  console.log('----------------------------------------------------');

  const dbConfig: PoolOptions = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Restaurant',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 5000,
  };

  console.log(`📌 Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`📌 Database: ${dbConfig.database}`);
  console.log(`📌 User: ${dbConfig.user}\n`);

  let pool: mysql.Pool | null = null;

  try {
    // 1. Create connection pool
    pool = mysql.createPool(dbConfig);

    // 2. Test Connection
    const connection = await pool.getConnection();
    console.log('✅ Connection test successful!\n');
    connection.release();

    // 3. Demo Query 1: Fetch list of tables
    console.log('📋 Demo 1: Fetching Database Tables...');
    const [tableRows] = await pool.query<RowDataPacket[]>('SHOW TABLES');
    console.log('Tables found in database:');
    console.table(tableRows);
    console.log('');

    // 4. Demo Query 2: Fetch records from `restaurant_info`
    console.log('📋 Demo 2: Fetching Restaurant Info details...');
    try {
      const [restaurants] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM restaurant_info LIMIT 5'
      );
      console.log(`Fetched ${restaurants.length} row(s) from 'restaurant_info':`);
      console.table(restaurants);
    } catch (err) {
      console.warn(`⚠️ Table 'restaurant_info' query skipped: ${(err as Error).message}`);
    }
    console.log('');

    // 5. Demo Query 3: Parameterized Query (Fetch Users)
    console.log('📋 Demo 3: Fetching Users with Parameterized Query...');
    try {
      const targetRole = 'ADMIN';
      const [users] = await pool.query<UserRow[]>(
        'SELECT id, name, email, phone, role FROM users WHERE role = ? LIMIT 5',
        [targetRole]
      );
      console.log(`Fetched ${users.length} user(s) with role = '${targetRole}':`);
      console.table(users);
    } catch (err) {
      console.warn(`⚠️ Table 'users' query skipped: ${(err as Error).message}`);
    }
    console.log('');

    console.log('🎉 TypeScript Sample Database Demo Completed!');

  } catch (error) {
    console.error('❌ Error executing database operations:');
    console.error(`   Message: ${(error as Error).message}`);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔒 Database connection pool closed.');
    }
  }
}

// Run the demo
runSampleDatabaseDemo();
