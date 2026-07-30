export const logger = {
  /**
   *
   * @param msg
   * @param {...any} meta
   */
  info: (msg: string, ...meta: any[]) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...meta),
  /**
   *
   * @param msg
   * @param {...any} meta
   */
  warn: (msg: string, ...meta: any[]) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...meta),
  /**
   *
   * @param msg
   * @param {...any} meta
   */
  error: (msg: string, ...meta: any[]) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...meta),
};
