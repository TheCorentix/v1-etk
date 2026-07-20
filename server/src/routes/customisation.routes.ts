import { Router } from 'express';
import { CustomisationController } from '../controllers/customisation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCustomisationSchema,
  updateCustomisationSchema,
  addNoteSchema,
  updateCustomisationStatusSchema,
} from '../validators/customisation.validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

const router = Router();
const controller = new CustomisationController();

// Customer Request Endpoints (Protected by Authentication checking)
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  validate(createCustomisationSchema),
  controller.create
);

router.put('/:id', authMiddleware, validate(updateCustomisationSchema), controller.update);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, controller.getById);

// Admin Stylist Panel Endpoints (Protected by Admin authorization checking)
router.post('/:id/notes', authMiddleware, adminMiddleware, validate(addNoteSchema), controller.addNote);
router.put('/:id/status', authMiddleware, adminMiddleware, validate(updateCustomisationStatusSchema), controller.updateStatus);

export default router;
