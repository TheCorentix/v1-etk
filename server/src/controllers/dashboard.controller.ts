import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  private dashboardService = new DashboardService();

  /**
   * Compiles gross metrics for the admin interface.
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.dashboardService.getAnalytics();
      sendSuccess(res, analytics, 'Dashboard analytics compiled successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default DashboardController;
