import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
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
// Optional auth: staff with product access also see DRAFT products, everyone else only PUBLISHED
router.get('/', optionalAuthMiddleware, controller.list);
router.get('/id/:id', controller.getById);
router.get('/slug/:slug', controller.getBySlug);

// Admin CRUD Inventory Endpoints (Chained with file upload parser and permissions check)
router.post(
  '/',
  authMiddleware,
  requirePermission('products.manage'),
  upload.array('images', 5),
  validate(createProductSchema),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  requirePermission('products.manage'),
  upload.array('images', 5),
  validate(updateProductSchema),
  controller.update
);

router.delete('/:id', authMiddleware, requirePermission('products.manage'), controller.delete);

export default router;
