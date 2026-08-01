import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'restaurant_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_secret',
});

/**
 *
 * @param fileBuffer
 * @param folder
 */
export async function uploadToCloudinary(fileBuffer: Buffer, folder: string = 'restaurant_menu'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.warn('⚠️ Cloudinary upload failed:', error.message);
          return resolve('');
        }
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
