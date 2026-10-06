import fs from 'fs/promises';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}

/**
 * Uploads a local file to Cloudinary and cleans up the temporary local file in the process.
 * @param localFilePath Path to the file stored temporarily on the server disk
 * @param folder Subfolder name inside the root 'etniko' directory (e.g. 'products', 'lookbook')
 */
export const uploadToCloudinary = async (
  localFilePath: string,
  folder:
  | 'products'
  | 'lookbook'
  | 'customisation-inspiration'
  | 'settings'
  | 'homepage/banner'
  | 'homepage/section'
  | 'homepage/video'
  | `library/${string}` // admin media library uploads (kept apart from product uploads)
): Promise<CloudinaryUploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `etniko/${folder}`,
      resource_type: 'auto', // Automatically detect image or video formats
    });

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      // Cloudinary reports the detected type; its typings also allow 'auto', so narrow it
      resourceType: result.resource_type === 'video' || result.resource_type === 'raw' ? result.resource_type : 'image',
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error(`Cloudinary upload failed for file: ${localFilePath}`, error);
    throw error;
  } finally {
    // Delete the temporary file from local storage to keep disk space free
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      logger.warn(`Failed to clean up temporary file: ${localFilePath}`, unlinkError);
    }
  }
};

/**
 * Extracts the public ID from a Cloudinary delivery URL
 * (e.g. https://res.cloudinary.com/demo/image/upload/v123/etniko/products/abc.jpg -> etniko/products/abc).
 * Returns null for non-Cloudinary URLs.
 */
export const publicIdFromCloudinaryUrl = (url: string): string | null => {
  const match = url.match(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Deletes an asset from Cloudinary using its public ID.
 * @param publicId Public ID of the asset stored in Cloudinary
 * @param isVideo Set to true if the asset is a video lookbook reel
 */
export const deleteFromCloudinary = async (
  publicId: string,
  isVideo = false
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: isVideo ? 'video' : 'image',
    });
    return result.result === 'ok';
  } catch (error) {
    logger.error(`Failed to delete Cloudinary asset with public ID: ${publicId}`, error);
    return false;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
};
