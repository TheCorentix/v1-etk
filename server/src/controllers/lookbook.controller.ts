import { Request, Response, NextFunction } from 'express';
import { LookbookService } from '../services/lookbook.service';
import { sendSuccess } from '../utils/response';

export class LookbookController {
  private lookbookService = new LookbookService();

  /**
   * Registers a new lookbook video reel (Admin only).
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, tags } = req.body;

      // Extract video and thumbnail streams populated by Multer's fields middleware
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localVideoPath = files?.video?.[0]?.path;
      const localThumbnailPath = files?.thumbnail?.[0]?.path;

      if (!localVideoPath) {
        res.status(400).json({
          success: false,
          message: 'Video file is required.',
          errors: ['video is required'],
        });
        return;
      }

      // Parse tags sent as JSON strings from form-data clients
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

      const look = await this.lookbookService.createLook(
        {
          title,
          tags: parsedTags || [],
        },
        localVideoPath,
        localThumbnailPath
      );

      sendSuccess(res, { look }, 'Lookbook video uploaded successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Modifies lookbook details, coordinates, or product tags (Admin only).
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { title, tags } = req.body;

      const parsedFields: any = {};
      if (title) parsedFields.title = title;
      if (tags) parsedFields.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;

      const look = await this.lookbookService.updateLook(id, parsedFields);
      sendSuccess(res, { look }, 'Lookbook updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Removes a lookbook post (Admin only).
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.lookbookService.deleteLook(id);
      sendSuccess(res, {}, 'Lookbook video deleted successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves detail logs for a specific lookbook.
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const look = await this.lookbookService.getLookById(id);
      if (!look) {
        res.status(404).json({ success: false, message: 'Lookbook video not found', errors: ['Not Found'] });
        return;
      }
      sendSuccess(res, { look }, 'Lookbook details retrieved.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lists lookbook videography feeds.
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const result = await this.lookbookService.listLooks(pageNum, limitNum);
      sendSuccess(res, result, 'Lookbook items retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default LookbookController;
