export const logger = {
  /**
   * Log info level messages
   */
  info: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    if (meta.length > 0) {
      console.log(`[INFO] ${timestamp} - ${msg}`, ...meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : m)));
    } else {
      console.log(`[INFO] ${timestamp} - ${msg}`);
    }
  },

  /**
   * Log warning level messages
   */
  warn: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    if (meta.length > 0) {
      console.warn(`[WARN] ${timestamp} - ${msg}`, ...meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : m)));
    } else {
      console.warn(`[WARN] ${timestamp} - ${msg}`);
    }
  },

  /**
   * Log error level messages
   */
  error: (msg: string, ...meta: any[]) => {
    const timestamp = new Date().toISOString();
    if (meta.length > 0) {
      console.error(`[ERROR] ${timestamp} - ${msg}`, ...meta.map(m => (typeof m === 'object' ? JSON.stringify(m) : m)));
    } else {
      console.error(`[ERROR] ${timestamp} - ${msg}`);
    }
  },
};
