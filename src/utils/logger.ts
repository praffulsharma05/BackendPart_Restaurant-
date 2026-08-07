import fs from 'fs';
import path from 'path';

// Directory to store hourly log files
const logsDir = path.resolve(process.cwd(), 'logs');
const serverLogPath = path.resolve(process.cwd(), 'server.log');

/**
 * Returns the file path for the current hour's log file inside the logs/ directory.
 * Format: logs/2026-08-07_17-00.log
 */
function getHourlyLogFilePath(d: Date): string {
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');

  const fileName = `${YYYY}-${MM}-${DD}_${HH}-00.log`;
  return path.join(logsDir, fileName);
}

function appendToFile(level: string, timestamp: string, msg: string, metaStr: string = '') {
  try {
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const formattedLine = `[${level}] ${timestamp} - ${msg}${metaStr ? ' ' + metaStr : ''}\n`;
    
    // 1. Write to hourly log file in logs/ directory (captures both errors and success logs)
    const hourlyFilePath = getHourlyLogFilePath(new Date());
    fs.appendFileSync(hourlyFilePath, formattedLine, 'utf8');

    // 2. Also write to root server.log for fallback/cPanel convenience
    fs.appendFileSync(serverLogPath, formattedLine, 'utf8');
  } catch (_err) {
    // Fail-safe catch if disk write fails
  }
}

export const logger = {
  /**
   * Log info level messages (Success / Operational logs)
   */
  info: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length > 0 ? meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ') : '';
    console.log(`[INFO] ${timestamp} - ${msg}`, ...meta);
    appendToFile('INFO', timestamp, msg, metaStr);
  },

  /**
   * Log warning level messages
   */
  warn: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length > 0 ? meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ') : '';
    console.warn(`[WARN] ${timestamp} - ${msg}`, ...meta);
    appendToFile('WARN', timestamp, msg, metaStr);
  },

  /**
   * Log error level messages (Error logs)
   */
  error: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length > 0 ? meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ') : '';
    console.error(`[ERROR] ${timestamp} - ${msg}`, ...meta);
    appendToFile('ERROR', timestamp, msg, metaStr);
  },
};

