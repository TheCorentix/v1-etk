import { Router, Request, Response, NextFunction } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, reviewStatusSchema } from '../validators/review.validator';
import { httpError } from '../utils/httpError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX_PHOTOS = 3;
const MAX_PHOTO_MB = 5;

// Ensure the local uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MAX_PHOTO_MB * 1024 * 1024, files: MAX_PHOTOS },
  // Photos only: anything else is refused before it is written to disk
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(httpError(400, 'Only image files can be attached to a review.'));
  },
});

// Turns upload problems (too big, too many) into clean 4xx responses
const uploadPhotos = (req: Request, res: Response, next: NextFunction): void => {
  upload.array('images', MAX_PHOTOS)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(httpError(413, `Each photo can be up to ${MAX_PHOTO_MB} MB.`));
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
        return next(httpError(400, `You can add up to ${MAX_PHOTOS} photos.`));
      }
      return next(httpError(400, err.message));
    }
    next(err);
  });
};

const router = Router();
const controller = new ReviewController();

// Public: approved reviews of a product, with the rating summary
router.get('/', controller.listPublic);

// Customers (signed in)
router.get('/eligibility/:productId', authMiddleware, controller.getEligibility);
router.post('/', authMiddleware, uploadPhotos, validate(createReviewSchema), controller.create);

// Moderation (Admin / Content Manager)
router.get('/admin/list', authMiddleware, requirePermission('reviews.manage'), controller.listAdmin);
router.put('/admin/:id/status', authMiddleware, requirePermission('reviews.manage'), validate(reviewStatusSchema), controller.setStatus);
router.delete('/admin/:id', authMiddleware, requirePermission('reviews.manage'), controller.remove);

// If a request fails after photos were already saved to disk (e.g. validation), remove them
router.use((err: unknown, req: Request, _res: Response, next: NextFunction) => {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => undefined))).finally(() => next(err));
});

export default router;
