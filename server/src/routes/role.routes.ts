import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { ASSIGNABLE_ROLES } from '../config/permissions';

const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(ASSIGNABLE_ROLES, {
      message: `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`,
    }),
  }),
});

const router = Router();
const controller = new RoleController();

// Only people who can manage roles (admins) may see or change any of this
router.use(authMiddleware, requirePermission('roles.manage'));

router.get('/', controller.getDefinitions);
router.get('/users', controller.listUsers);
router.put('/users/:uid', validate(updateUserRoleSchema), controller.updateUserRole);

export default router;
