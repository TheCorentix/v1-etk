import { Router } from 'express';
import { TestimonialController } from '../controllers/testimonial.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from '../validators/testimonial.validator';

const router = Router();
const controller = new TestimonialController();

// Public listing (storefront shows ACTIVE testimonials; signed-in admins also see hidden ones)
router.get('/', optionalAuthMiddleware, controller.list);

// Admin management endpoints
router.post('/', authMiddleware, requirePermission('content.manage'), validate(createTestimonialSchema), controller.create);
router.put('/:id', authMiddleware, requirePermission('content.manage'), validate(updateTestimonialSchema), controller.update);
router.delete('/:id', authMiddleware, requirePermission('content.manage'), controller.delete);

export default router;
