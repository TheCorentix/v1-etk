import { Router } from 'express';
import { LookbookController } from '../controllers/lookbook.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLookbookSchema, updateLookbookSchema } from '../validators/lookbook.validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the local uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit for lookbook videos
});

const router = Router();
const controller = new LookbookController();

// Public Snaps Feed Queries
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Administrative Content Management Endpoints
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  validate(createLookbookSchema),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  validate(updateLookbookSchema),
  controller.update
);

router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;
