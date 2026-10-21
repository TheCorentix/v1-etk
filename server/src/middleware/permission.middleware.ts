import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Permission, hasPermission } from '../config/permissions';

/**
 * Allows the request through when the signed-in user's role grants ANY of the given
 * permissions. Use after authMiddleware.
 */
export const requirePermission =
  (...permissions: Permission[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !permissions.some((permission) => hasPermission(req.user!.role, permission))) {
      res.status(403).json({
        success: false,
        message: "Access Denied. You don't have permission to do this.",
        errors: ['Forbidden'],
      });
      return;
    }

    next();
  };

export default requirePermission;
