import fs from 'fs';
import path from 'path';
import { logger } from './logger';

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

    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
    const port = process.env.PORT || 5000;
    const baseUrl = process.env.BASE_URL || (isProd ? 'https://mow.landmaarkdeveloper.com' : `http://localhost:${port}`);
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

    return `${cleanBaseUrl}/uploads/${folder}/${fileName}`;
  } catch (error) {
    logger.error('[LocalStorage] Error saving local file:', error);
    throw new Error('Failed to save uploaded file locally');
  }
}
