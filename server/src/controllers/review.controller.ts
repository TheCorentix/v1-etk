import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ReviewStatus } from '../repositories/review.repository';
import { sendSuccess } from '../utils/response';
import { httpError } from '../utils/httpError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const REVIEW_STATUSES: ReviewStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export class ReviewController {
  private reviewService = new ReviewService();

  /** Approved reviews of one product, with the rating summary. Public. */
  listPublic = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, page, limit } = req.query as Record<string, string | undefined>;
      if (!productId) throw httpError(400, 'productId is required.');

      const result = await this.reviewService.listPublic(
        productId,
        Math.max(1, parseInt(page || '1', 10) || 1),
        Math.min(50, Math.max(1, parseInt(limit || '10', 10) || 10))
      );
      sendSuccess(res, result, 'Reviews retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /** Can the signed-in customer review this product, and if not, why not. */
  getEligibility = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params as { productId: string };
      const eligibility = await this.reviewService.getEligibility(req.user!.uid, productId);
      sendSuccess(res, eligibility, 'Eligibility checked.', 200);
    } catch (error) {
      next(error);
    }
  };

  /** A customer submits a review (with optional photos). It waits for approval. */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, rating, title, comment } = req.body;
      const files = (req.files as Express.Multer.File[] | undefined) || [];

      const review = await this.reviewService.createReview(
        { uid: req.user!.uid, name: req.user!.name || 'Customer' },
        { productId, rating, title, comment },
        files.map((file) => file.path)
      );

      sendSuccess(
        res,
        { review: { id: review.id, status: review.status, rating: review.rating } },
        'Thank you! Your review will appear once our team has approved it.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /** Moderation list with counts (Admin / Content Manager). */
  listAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query as { status?: string };
      const filter = status && (REVIEW_STATUSES as string[]).includes(status.toUpperCase())
        ? (status.toUpperCase() as ReviewStatus)
        : undefined;
      sendSuccess(res, await this.reviewService.listForAdmin(filter), 'Reviews retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  setStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const review = await this.reviewService.setStatus(id, req.body.status, req.user!.email || 'admin');
      sendSuccess(res, { review }, 'Review updated.', 200);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.reviewService.deleteReview(id);
      sendSuccess(res, {}, 'Review deleted.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default ReviewController;
