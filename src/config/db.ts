import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Robust .env loading for cPanel Passenger environment
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'kylkqqhv_Restaurant',
  password: process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== '' ? process.env.DB_PASSWORD : 'Pr@fful_213',
  database: process.env.DB_NAME || 'kylkqqhv_Restaurant',
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
