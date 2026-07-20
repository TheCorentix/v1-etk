import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  verifyPaymentSchema,
  updateStatusSchema,
  addTrackingSchema,
} from '../validators/order.validator';

const router = Router();
const controller = new OrderController();

// Customer Order Endpoints (Protected by Auth middleware)
router.post('/', authMiddleware, validate(createOrderSchema), controller.create);
router.post('/verify', authMiddleware, validate(verifyPaymentSchema), controller.verifyPayment);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, controller.getById);
router.get('/:id/invoice', authMiddleware, controller.getInvoice);

// Admin Fulfillment Endpoints (Protected by Admin authorization checks)
router.put('/:id/status', authMiddleware, adminMiddleware, validate(updateStatusSchema), controller.updateStatus);
router.put('/:id/tracking', authMiddleware, adminMiddleware, validate(addTrackingSchema), controller.addTracking);

export default router;
