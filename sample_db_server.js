/**
 * ============================================================================
 * Standalone Web & Database Test File for MilesWeb cPanel Deployment
 * ============================================================================
 * 
 * You can upload ONLY this file (and .env) to MilesWeb cPanel!
 * It starts a minimal HTTP server that queries the database and shows
 * the results directly in your web browser.
 * 
 * cPanel Application Startup File: sample_db_server.js
 * ============================================================================
 */

const http = require('http');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  let dbPool;
  let outputHtml = '';

  try {
    // Database Configuration
    const dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Restaurant',
      waitForConnections: true,
      connectionLimit: 5
    };

    dbPool = mysql.createPool(dbConfig);

    // Test Connection
    const connection = await dbPool.getConnection();
    connection.release();

    // Query 1: Database Tables
    const [tables] = await dbPool.query('SHOW TABLES');

    // Query 2: Restaurant Info & Restaurants
    let restaurants = [];
    try {
      const [rows] = await dbPool.query('SELECT * FROM restaurant_info LIMIT 5');
      restaurants = rows;
    } catch (e) {
      try {
        const [rows] = await dbPool.query('SELECT * FROM restaurants LIMIT 5');
        restaurants = rows;
      } catch (err2) {
        restaurants = [{ note: `Could not fetch restaurant data: ${e.message}` }];
      }
    }

    outputHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MilesWeb DB Test Success</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; }
          .card { background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
          h1 { color: #38bdf8; }
          h2 { color: #4ade80; border-bottom: 1px solid #334155; padding-bottom: 8px; }
          pre { background: #090d16; padding: 12px; border-radius: 8px; overflow-x: auto; color: #a7f3d0; }
          .badge { background: #166534; color: #86efac; padding: 4px 12px; border-radius: 9999px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🚀 MilesWeb Database Connection Test</h1>
        
        <div class="card">
          <h2>Status: <span class="badge">Connected Successfully ✅</span></h2>
          <p><strong>Host:</strong> ${dbConfig.host}:${dbConfig.port}</p>
          <p><strong>Database:</strong> ${dbConfig.database}</p>
          <p><strong>User:</strong> ${dbConfig.user}</p>
        </div>

        <div class="card">
          <h2>📋 Database Tables Found</h2>
          <pre>${JSON.stringify(tables, null, 2)}</pre>
        </div>

        <div class="card">
          <h2>🍽️ Sample Data (restaurant_info)</h2>
          <pre>${JSON.stringify(restaurants, null, 2)}</pre>
        </div>
      </body>
      </html>
    `;

    res.writeHead(200);
    res.end(outputHtml);

  } catch (err) {
    outputHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MilesWeb DB Connection Error</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; }
          .card { background: #1e293b; padding: 20px; border-radius: 12px; border-left: 6px solid #ef4444; }
          h1 { color: #f87171; }
          pre { background: #450a0a; padding: 12px; border-radius: 8px; color: #fca5a5; }
        </style>
      </head>
      <body>
        <h1>❌ Database Connection Error</h1>
        <div class="card">
          <p>Could not connect to database on MilesWeb server.</p>
          <pre>${err.stack || err.message}</pre>
        </div>
      </body>
      </html>
    `;
    res.writeHead(500);
    res.end(outputHtml);
  } finally {
    if (dbPool) {
      await dbPool.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
