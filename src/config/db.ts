import '../utils/cpanelEnv';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

// Standard .env loading (preserves pre-existing cPanel environment variables)
dotenv.config();

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 5000,
});

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
    connection.release();
    return true;
  } catch (error) {
    console.warn(`⚠️ Warning: Database connection failed. Ensure MySQL is accessible on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}:`, (error as Error).message);
    return false;
  }
}
