import fs from 'fs/promises';
import { MediaRepository, MediaDocument } from '../repositories/media.repository';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { httpError } from '../utils/httpError';
import { logger } from '../config/logger';

// Folder keys offered by the admin media library dialog
export const LIBRARY_FOLDERS = ['media_library', 'products', 'homepage', 'lookbooks'] as const;
export type LibraryFolder = (typeof LIBRARY_FOLDERS)[number];

export interface MediaListFilters {
  page: number;
  limit: number;
  folder?: string;
  resourceType?: string;
  search?: string;
}

export class MediaService {
  private mediaRepository = new MediaRepository();

  /**
   * Lists library assets (newest first) with filters, paging and where each one is used.
   */
  async listMedia(filters: MediaListFilters) {
    const [assets, usage] = await Promise.all([
      this.mediaRepository.listAll(),
      this.mediaRepository.buildUsageMap(),
    ]);

    const search = filters.search?.trim().toLowerCase();
    const matching = assets.filter(
      (asset) =>
        (!filters.folder || asset.folder === filters.folder) &&
        (!filters.resourceType || asset.resourceType === filters.resourceType) &&
        (!search || asset.filename.toLowerCase().includes(search))
    );

    const totalItems = matching.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filters.limit));
    const start = (filters.page - 1) * filters.limit;

    return {
      items: matching
        .slice(start, start + filters.limit)
        .map((asset) => ({ ...asset, usedIn: usage.get(asset.url) ?? [] })),
      pagination: { currentPage: filters.page, totalPages, totalItems, limit: filters.limit },
    };
  }

  /**
   * Uploads a file to Cloudinary (under etniko/library/<folder>) and catalogs it.
   * The temporary local file is always removed.
   */
  async uploadMedia(
    file: Express.Multer.File,
    folder: string | undefined,
    createdBy: string
  ): Promise<MediaDocument> {
    const targetFolder = (folder || 'media_library') as LibraryFolder;
    if (!LIBRARY_FOLDERS.includes(targetFolder)) {
      await fs.unlink(file.path).catch(() => undefined);
      throw httpError(400, `Folder must be one of: ${LIBRARY_FOLDERS.join(', ')}.`);
    }

    // uploadToCloudinary deletes the temp file whether or not the upload succeeds
    const uploaded = await uploadToCloudinary(file.path, `library/${targetFolder}`);

    const media = await this.mediaRepository.create({
      url: uploaded.secureUrl,
      publicId: uploaded.publicId,
      filename: file.originalname,
      folder: targetFolder,
      resourceType: uploaded.resourceType,
      format: uploaded.format,
      fileSize: uploaded.bytes,
      createdBy,
    });

    logger.info(`🖼️ Media uploaded: ${media.filename} (${targetFolder}) by ${createdBy}`);
    return media;
  }

  /**
   * Permanently deletes an asset from Cloudinary and the library.
   * Refused while any product, banner, testimonial, etc. still uses it.
   */
  async deleteMedia(id: string): Promise<void> {
    const asset = await this.mediaRepository.findById(id);
    if (!asset) {
      throw httpError(404, 'Media asset not found.');
    }

    const usage = await this.mediaRepository.buildUsageMap();
    const usedIn = usage.get(asset.url) ?? [];
    if (usedIn.length > 0) {
      throw httpError(409, `This asset is still in use (${usedIn.join(', ')}). Remove it there first.`);
    }

    const removed = await deleteFromCloudinary(asset.publicId, asset.resourceType === 'video');
    if (!removed) {
      logger.warn(`Cloudinary did not confirm deletion of ${asset.publicId}; removing the library entry anyway.`);
    }

    await this.mediaRepository.delete(id);
    logger.info(`🗑️ Media deleted: ${asset.filename}`);
  }
}
