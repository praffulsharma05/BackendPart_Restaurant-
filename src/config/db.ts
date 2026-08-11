import '../utils/cpanelEnv';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

// Standard .env loading (preserves pre-existing cPanel environment variables)
dotenv.config();

// Strict Environment Variable Validation helper
function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value === null) {
    throw new Error(`❌ Database Configuration Error: Missing required environment variable "${key}" in .env`);
  }
  return value;
}

// Strict Environment Variable Driven Database Configuration
const dbConfig = {
  host: getRequiredEnv('DB_HOST', '127.0.0.1'),
  port: Number(getRequiredEnv('DB_PORT', '3306')),
  user: getRequiredEnv('DB_USER', 'root'),
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: getRequiredEnv('DB_NAME', 'Restaurant'),
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS ? process.env.DB_WAIT_FOR_CONNECTIONS === 'true' : true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0,
  enableKeepAlive: process.env.DB_ENABLE_KEEP_ALIVE ? process.env.DB_ENABLE_KEEP_ALIVE === 'true' : true,
  keepAliveInitialDelay: Number(process.env.DB_KEEP_ALIVE_INITIAL_DELAY) || 0,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 5000,
};

export const dbPool = mysql.createPool(dbConfig);

// Prevent unhandled DB pool errors from crashing the Node.js process
(dbPool as any).on('error', (err: any) => {
  console.error('⚠️ MySQL Pool Error Event:', err.message || err);
});

/**
 *
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await dbPool.getConnection();
    console.log(`✅ Connected to MySQL Database (${process.env.DB_NAME || 'Restaurant'}) at ${process.env.DB_HOST || '127.0.0.1'}`);
    
    // Reset all existing user reward points to 0 as requested and disable reward program
    try {
      await connection.query('UPDATE users SET reward_points = 0');
      await connection.query('DELETE FROM reward_transactions');
      await connection.query(`
        INSERT INTO reward_settings (id, reward_percentage, max_points_per_order, monthly_point_limit, point_expiry_days, redemption_ratio, is_active)
        VALUES (1, 0.00, 0, 0, 0, 0.00, FALSE)
        ON DUPLICATE KEY UPDATE
          reward_percentage = 0.00,
          max_points_per_order = 0,
          monthly_point_limit = 0,
          point_expiry_days = 0,
          redemption_ratio = 0.00,
          is_active = FALSE
      `);
    } catch (_e) { }

    connection.release();
    return true;
  } catch (error) {
    console.warn(`⚠️ Warning: Database connection failed. Ensure MySQL is accessible on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}:`, (error as Error).message);
    return false;
  }
}
