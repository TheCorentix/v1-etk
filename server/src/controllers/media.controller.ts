import { Response, NextFunction } from 'express';
import { MediaService } from '../services/media.service';
import { sendSuccess } from '../utils/response';
import { httpError } from '../utils/httpError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class MediaController {
  private mediaService = new MediaService();

  /**
   * Lists media library assets (Admin only).
   */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, folder, resourceType, search } = req.query as Record<string, string | undefined>;

      const result = await this.mediaService.listMedia({
        page: Math.max(1, parseInt(page || '1', 10) || 1),
        limit: Math.min(60, Math.max(1, parseInt(limit || '20', 10) || 20)),
        // The dialog sends "ALL" / empty for "no filter"
        folder: folder && folder !== 'ALL' ? folder : undefined,
        resourceType: resourceType || undefined,
        search,
      });

      sendSuccess(res, result, 'Media retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Uploads one file to the media library (Admin only).
   */
  upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw httpError(400, 'No file was uploaded. Choose an image or video first.');
      }

      const media = await this.mediaService.uploadMedia(
        req.file,
        req.body?.folder,
        req.user?.email || 'admin'
      );
      sendSuccess(res, { media }, 'Media uploaded successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes an unused asset from the library and Cloudinary (Admin only).
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.mediaService.deleteMedia(id);
      sendSuccess(res, {}, 'Media deleted successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default MediaController;
