import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 *
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await dbPool.getConnection();
    console.log('✅ Connected to MySQL Database (Restaurant)');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ Warning: Database connection failed. Ensure MySQL is running on 127.0.0.1:3306:', (error as Error).message);
    return false;
  }
}
