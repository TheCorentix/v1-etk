import { Router, Request, Response, NextFunction } from 'express';
import { MediaController } from '../controllers/media.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { httpError } from '../utils/httpError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the local uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const MAX_FILE_SIZE_MB = 15; // matches the limit shown in the admin upload dialog

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  // Reject anything that isn't an image or video before it is written to disk
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(httpError(400, 'Only image and video files can be uploaded to the media library.'));
    }
  },
});

// Turns multer failures (e.g. file too large) into clean 4xx responses
const uploadSingleFile = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const tooLarge = err.code === 'LIMIT_FILE_SIZE';
      next(httpError(tooLarge ? 413 : 400, tooLarge ? `File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.` : err.message));
    } else {
      next(err);
    }
  });
};

const router = Router();
const controller = new MediaController();

// The whole media library is admin-only
router.use(authMiddleware, adminMiddleware);

router.get('/', controller.list);
router.post('/', uploadSingleFile, controller.upload);
router.delete('/:id', controller.delete);

export default router;
