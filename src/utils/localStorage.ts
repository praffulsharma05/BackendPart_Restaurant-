import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { API_CONFIG } from '../constants';

/**
 * Saves an uploaded file buffer to the local disk in the uploads/<folder> directory.
 * @param fileBuffer The raw Buffer of the file
 * @param originalName The original filename provided by multer
 * @param folder Subfolder name inside uploads directory (e.g. 'restaurant_menu', 'restaurant_logos', 'user_avatars', 'payment_screenshots')
 * @returns Relative URL path pointing to the saved image (e.g. /uploads/restaurant_menu/1785234234-dish.png)
 */
export function saveLocalFile(fileBuffer: Buffer, originalName: string, folder: string = 'general'): string {
  try {
    const targetDir = path.join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const cleanName = originalName
      ? originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
      : 'file.png';
    const fileName = `${Date.now()}-${cleanName}`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, fileBuffer);
    logger.info(`[LocalStorage] File saved successfully: ${filePath}`);

    const cleanBaseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
    const prefix = API_CONFIG.UPLOADS_PREFIX.startsWith('/') ? API_CONFIG.UPLOADS_PREFIX : `/${API_CONFIG.UPLOADS_PREFIX}`;

    return `${cleanBaseUrl}${prefix}${folder}/${fileName}`;
  } catch (error) {
    logger.error('[LocalStorage] Error saving local file:', error);
    throw new Error('Failed to save uploaded file locally');
  }
}
