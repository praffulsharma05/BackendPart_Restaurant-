/**
 * ============================================================================
 * Sample Database Connection & Data Fetching Demo (JavaScript)
 * ============================================================================
 * 
 * This file demonstrates:
 * 1. Connecting to MySQL/MariaDB using `mysql2/promise` and `dotenv`.
 * 2. Creating a connection pool.
 * 3. Testing database connection.
 * 4. Performing basic SELECT queries and parameterized queries.
 * 5. Safely closing the connection pool.
 * 
 * How to run:
 *   node sample_db_demo.js
 * ============================================================================
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function runSampleDatabaseDemo() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Database Connection Sample Demo...');
  console.log('----------------------------------------------------');

  // 1. Connection configuration from environment variables or defaults
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Restaurant',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  };

  console.log(`📌 Connecting to Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`📌 Target Database: ${dbConfig.database}`);
  console.log(`📌 User: ${dbConfig.user}\n`);

  let pool;

  try {
    // 2. Create the Database Connection Pool
    pool = mysql.createPool(dbConfig);

    // 3. Test Connection
    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL/MariaDB database!\n');
    connection.release(); // Always release connection back to pool

    // 4. Sample Query 1: Fetch list of all tables in the current database
    console.log('📋 Demo 1: Fetching Database Tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Found Tables:');
    console.table(tables);
    console.log('');

    // 5. Sample Query 2: Fetch Data from `restaurant_info` table
    console.log('📋 Demo 2: Fetching Restaurant Info details...');
    try {
      const [restaurants] = await pool.query('SELECT * FROM restaurant_info LIMIT 5');
      console.log(`Fetched ${restaurants.length} row(s) from 'restaurant_info':`);
      console.table(restaurants);
    } catch (tableErr) {
      console.warn(`⚠️ Note: Table 'restaurant_info' error: ${tableErr.message}`);
    }
    console.log('');

    // 6. Sample Query 3: Parameterized Query Example (Prevents SQL Injection)
    console.log('📋 Demo 3: Fetching Users with Parameterized Query...');
    try {
      const targetRole = 'ADMIN';
      const [users] = await pool.query(
        'SELECT id, name, email, phone, role FROM users WHERE role = ? LIMIT 5',
        [targetRole]
      );
      console.log(`Fetched ${users.length} user(s) with role = '${targetRole}':`);
      console.table(users);
    } catch (tableErr) {
      console.warn(`⚠️ Note: Table 'users' might not exist yet: ${tableErr.message}`);
    }
    console.log('');

    console.log('🎉 Sample Database Demo completed successfully!');

  } catch (error) {
    console.error('❌ Database Error occurred:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
  } finally {
    // 7. Always close the connection pool when finished in single-run scripts
    if (pool) {
      await pool.end();
      console.log('\n🔒 Database pool connection closed.');
    }
  }
}

// Execute the demo function
runSampleDatabaseDemo();
