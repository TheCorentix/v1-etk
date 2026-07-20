import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const controller = new DashboardController();

// Analytics overview endpoint (Strictly Admin only)
router.get('/analytics', authMiddleware, adminMiddleware, controller.getAnalytics);

export default router;
