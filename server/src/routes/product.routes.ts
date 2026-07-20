import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const router = Router();
const controller = new ProductController();

// Public Catalog Endpoints
router.get('/', controller.list);
router.get('/id/:id', controller.getById);
router.get('/slug/:slug', controller.getBySlug);

// Admin CRUD Inventory Endpoints (Chained with file upload parser and permissions check)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 5),
  validate(createProductSchema),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 5),
  validate(updateProductSchema),
  controller.update
);

router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;
