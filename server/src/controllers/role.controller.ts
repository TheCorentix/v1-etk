import { Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class RoleController {
  private roleService = new RoleService();

  /** The roles, the permissions, and which role has which. */
  getDefinitions = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, this.roleService.getDefinitions(), 'Roles retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /** Everyone with an account and their current role. */
  listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.roleService.listUsers(req.user!.uid);
      sendSuccess(res, { users }, 'Users retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /** Gives a user a different role. */
  updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { uid } = req.params as { uid: string };
      const { role } = req.body;
      const user = await this.roleService.changeRole(
        { uid: req.user!.uid, email: req.user!.email },
        uid,
        role
      );
      sendSuccess(res, { user }, 'Role updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default RoleController;
