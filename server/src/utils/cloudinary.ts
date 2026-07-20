import fs from 'fs/promises';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
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
): Promise<CloudinaryUploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `etniko/${folder}`,
      resource_type: 'auto', // Automatically detect image or video formats
    });

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
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
