import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'restaurant_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_secret',
});

export async function uploadToCloudinary(fileBuffer: Buffer, folder: string = 'restaurant_menu'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          // If Cloudinary credentials are not configured, fallback to mock upload image URL
          console.warn('⚠️ Cloudinary upload failed, returning placeholder image URL:', error.message);
          return resolve('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500');
        }
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
