import fs from 'fs';
import path from 'path';
import { logger } from './logger';

function parseAndSetLine(line: string) {
  const trimmed = line.trim();
  
  // Match: export KEY=VALUE or export KEY="VALUE"
  let match = trimmed.match(/^export\s+([A-Za-z0-9_]+)=(.*)$/);
  if (!match) {
    // Match: SetEnv KEY VALUE or SetEnv KEY "VALUE"
    match = trimmed.match(/^SetEnv\s+([A-Za-z0-9_]+)\s+(.*)$/i);
  }
  if (!match) {
    // Match: KEY=VALUE
    match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
  }

  if (match) {
    const key = match[1];
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key] && val) {
      process.env[key] = val;
      return true;
    }
  }
  return false;
}

function scanFile(filePath: string): number {
  let count = 0;
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        if (parseAndSetLine(line)) count++;
      }
    }
  } catch (_e) {}
  return count;
}

function scanDirectoryRecursively(dir: string, depth: number = 0): void {
  if (depth > 4) return;
  try {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          scanDirectoryRecursively(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        if (entry.name === 'activate' || entry.name === '.env' || entry.name === '.htaccess') {
          const loaded = scanFile(fullPath);
          if (loaded > 0) {
            logger.info(`[cPanel Env Bridge] Loaded ${loaded} env vars from ${fullPath}`);
          }
        }
      }
    }
  } catch (_e) {}
}

export function loadCpanelNodeVenvEnv(): void {
  try {
    const cwd = process.cwd();
    // 1. Scan app root .htaccess and .env
    scanFile(path.join(cwd, '.htaccess'));
    scanFile(path.join(cwd, '.env'));

    // 2. Scan parent directories and cPanel virtualenv locations
    const parentDir = path.resolve(cwd, '..');
    const grandParentDir = path.resolve(parentDir, '..');

    const searchRoots = [
      cwd,
      parentDir,
      grandParentDir,
      path.join(parentDir, 'nodevenv'),
      path.join(parentDir, '.nodevenv'),
      path.join(grandParentDir, 'nodevenv'),
    ];

    for (const root of searchRoots) {
      scanDirectoryRecursively(root);
    }
  } catch (err: any) {
    logger.warn('[cPanel Env Bridge] Scan note:', err?.message || err);
  }
}

// Run immediately on module import
loadCpanelNodeVenvEnv();
