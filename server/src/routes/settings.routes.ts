import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit for banner images
});

const router = Router();
const controller = new SettingsController();

// Public Configurations Endpoints
router.get('/', controller.get);

// Admin Configuration Endpoints (Protected by role verification checks)
router.put('/', authMiddleware, adminMiddleware, validate(updateSettingsSchema), controller.update);
router.post('/banner', authMiddleware, adminMiddleware, upload.single('image'), controller.uploadBanner);

export default router;
