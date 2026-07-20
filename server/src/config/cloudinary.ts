import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

try {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true, // Ensure all URLs are generated with HTTPS
  });

  console.log('☁️ Cloudinary SDK configured successfully.');
} catch (error) {
  console.error('❌ Failed to configure Cloudinary SDK:', error);
}

export { cloudinary };
export default cloudinary;
