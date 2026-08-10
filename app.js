// cPanel / Phusion Passenger Node.js Application Startup File
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately in Passenger boot environment
dotenv.config();

function parseAndSetLine(line) {
  const trimmed = line.trim();
  let match = trimmed.match(/^export\s+([A-Za-z0-9_]+)=(.*)$/);
  if (!match) match = trimmed.match(/^SetEnv\s+([A-Za-z0-9_]+)\s+(.*)$/i);
  if (!match) match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);

  if (match) {
    const key = match[1];
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key] && val) {
      process.env[key] = val;
    }
  }
}

function scanFile(filePath) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        parseAndSetLine(line);
      }
    }
  } catch (_e) {}
}

function scanDir(dir, depth = 0) {
  if (depth > 4) return;
  try {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          scanDir(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        if (entry.name === 'activate' || entry.name === '.env' || entry.name === '.htaccess') {
          scanFile(fullPath);
        }
      }
    }
  } catch (_e) {}
}

try {
  const cwd = process.cwd();
  scanFile(path.join(cwd, '.htaccess'));
  scanFile(path.join(cwd, '.env'));
  const p1 = path.resolve(cwd, '..');
  const p2 = path.resolve(p1, '..');
  scanDir(cwd);
  scanDir(p1);
  scanDir(path.join(p1, 'nodevenv'));
  scanDir(path.join(p1, '.nodevenv'));
  scanDir(p2);
} catch (_e) {}

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

