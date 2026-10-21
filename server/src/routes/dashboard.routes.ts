import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();
const controller = new DashboardController();

// Analytics overview endpoint (Strictly Admin only)
router.get('/analytics', authMiddleware, requirePermission('dashboard.view'), controller.getAnalytics);

export default router;
