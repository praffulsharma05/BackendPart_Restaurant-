// cPanel / Phusion Passenger Node.js Application Startup File
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately in Passenger boot environment
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const logFile = path.join(__dirname, 'debug.log');

function debugLog(msg) {
  try {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, line);
  } catch (_e) {}
}

debugLog(`🚀 Starting Node.js App from app.js... DB_USER=${process.env.DB_USER || 'NOT_FOUND'}`);

try {
  const server = require(path.join(__dirname, 'dist', 'server.js'));
  debugLog('✅ Successfully loaded dist/server.js');
  module.exports = server.default || server;
} catch (err) {
  debugLog('❌ CRITICAL ERROR loading dist/server.js: ' + (err.stack || err.message || err));
  console.error('CRITICAL ERROR loading dist/server.js:', err);
  throw err;
}

