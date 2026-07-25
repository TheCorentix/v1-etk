import { Router } from 'express';
import { TestimonialController } from '../controllers/testimonial.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from '../validators/testimonial.validator';

const router = Router();
const controller = new TestimonialController();

// Public listing (storefront shows ACTIVE testimonials)
router.get('/', controller.list);

// Admin management endpoints
router.post('/', authMiddleware, adminMiddleware, validate(createTestimonialSchema), controller.create);
router.put('/:id', authMiddleware, adminMiddleware, validate(updateTestimonialSchema), controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;
