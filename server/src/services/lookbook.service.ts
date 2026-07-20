import { LookbookRepository, LookbookDocument, HotspotTag } from '../repositories/lookbook.repository';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { getPaginationMetadata, PaginationMeta } from '../utils/pagination';
import { logger } from '../config/logger';

export class LookbookService {
  private lookbookRepository = new LookbookRepository();

  /**
   * Registers a new lookbook video reel, uploading the media file to Cloudinary.
   */
  async createLook(
    lookData: Omit<LookbookDocument, 'videoUrl' | 'thumbnailUrl'>,
    localVideoPath: string,
    localThumbnailPath?: string
  ): Promise<LookbookDocument> {
    try {
      // 1. Upload video file to Cloudinary lookbook folder
      const videoResult = await uploadToCloudinary(localVideoPath, 'lookbook');

      // 2. Resolve thumbnail image URL
      let thumbnailUrl = '';
      if (localThumbnailPath) {
        const thumbResult = await uploadToCloudinary(localThumbnailPath, 'lookbook');
        thumbnailUrl = thumbResult.secureUrl;
      } else {
        // Fallback: Utilize Cloudinary's dynamic video-to-image transformation path (.jpg extension format)
        thumbnailUrl = videoResult.secureUrl.replace(/\.[^/.]+$/, '.jpg');
      }

      const newLook: Omit<LookbookDocument, 'id'> = {
        ...lookData,
        videoUrl: videoResult.secureUrl,
        thumbnailUrl,
      };

      const savedLook = await this.lookbookRepository.create(newLook);
      logger.info(`🎬 Lookbook video registered: "${savedLook.title}" (ID: ${savedLook.id})`);
      return savedLook;
    } catch (error) {
      logger.error('Error in LookbookService createLook:', error);
      throw error;
    }
  }

  /**
   * Modifies an existing lookbook video tags, coordinates, or title.
   */
  async updateLook(id: string, data: Partial<LookbookDocument>): Promise<LookbookDocument | null> {
    const existing = await this.lookbookRepository.findById(id);
    if (!existing) {
      throw new Error(`Lookbook with ID ${id} not found.`);
    }
    return this.lookbookRepository.update(id, data);
  }

  /**
   * Removes a lookbook document and deletes its source video and thumbnail from Cloudinary.
   */
  async deleteLook(id: string): Promise<void> {
    try {
      const look = await this.lookbookRepository.findById(id);
      if (!look) {
        throw new Error(`Lookbook with ID ${id} not found.`);
      }

      // Purge video from Cloudinary
      const videoUrlParts = look.videoUrl.split('/');
      const videoFile = videoUrlParts[videoUrlParts.length - 1];
      const videoPublicId = `etniko/lookbook/${videoFile.split('.')[0]}`;
      await deleteFromCloudinary(videoPublicId, true);

      // Purge custom thumbnail if it exists and isn't just a transformed jpg path of the video
      if (look.thumbnailUrl && !look.thumbnailUrl.startsWith(look.videoUrl.replace(/\.[^/.]+$/, ''))) {
        const thumbUrlParts = look.thumbnailUrl.split('/');
        const thumbFile = thumbUrlParts[thumbUrlParts.length - 1];
        const thumbPublicId = `etniko/lookbook/${thumbFile.split('.')[0]}`;
        await deleteFromCloudinary(thumbPublicId);
      }

      await this.lookbookRepository.delete(id);
      logger.info(`🎬 Deleted lookbook video document: "${look.title}" (ID: ${id})`);
    } catch (error) {
      logger.error(`Error in LookbookService deleteLook for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lists lookbooks with pagination.
   */
  async listLooks(page = 1, limit = 10): Promise<{ items: LookbookDocument[]; pagination: PaginationMeta }> {
    const { items, total } = await this.lookbookRepository.list({ page, limit });
    const pagination = getPaginationMetadata(total, page, limit);
    return { items, pagination };
  }

  /**
   * Fetches details of a specific lookbook.
   */
  async getLookById(id: string): Promise<LookbookDocument | null> {
    return this.lookbookRepository.findById(id);
  }
}

export default LookbookService;
