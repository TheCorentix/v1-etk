import { UserRepository, UserDocument, UserRole } from '../repositories/user.repository';
import {
  ASSIGNABLE_ROLES,
  PERMISSIONS,
  PERMISSION_INFO,
  ROLE_INFO,
  STAFF_ROLES,
  isOwnerEmail,
  isStaff,
  roleLabel,
} from '../config/permissions';
import { httpError } from '../utils/httpError';
import { logger } from '../config/logger';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  isStaff: boolean;
  isYou: boolean; // The signed-in admin (can't change their own role)
  isOwner: boolean; // Listed in ADMIN_EMAILS (role is fixed)
  createdAt?: string;
  roleChangedBy?: string;
  roleChangedAt?: string;
}

const toTeamMember = (user: UserDocument, actorUid: string): TeamMember => ({
  id: user.id as string,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  roleLabel: roleLabel(user.role),
  isStaff: isStaff(user.role),
  isYou: user.id === actorUid,
  isOwner: isOwnerEmail(user.email),
  createdAt: user.createdAt,
  roleChangedBy: user.roleChangedBy,
  roleChangedAt: user.roleChangedAt,
});

export class RoleService {
  private userRepository = new UserRepository();

  /** What each role can do, for the Roles & Permissions tab. */
  getDefinitions() {
    return {
      roles: STAFF_ROLES.map((key) => ({ key, ...ROLE_INFO[key] })),
      permissions: PERMISSIONS.map((key) => ({ key, ...PERMISSION_INFO[key] })),
    };
  }

  /** All users, team members first, then everyone else newest-first. */
  async listUsers(actorUid: string): Promise<TeamMember[]> {
    const users = await this.userRepository.listAll();
    const roleOrder = (role: string) => {
      const index = (STAFF_ROLES as readonly string[]).indexOf(role);
      return index === -1 ? STAFF_ROLES.length : index;
    };

    return users
      .map((user) => toTeamMember(user, actorUid))
      .sort(
        (a, b) =>
          roleOrder(a.role) - roleOrder(b.role) ||
          (b.createdAt || '').localeCompare(a.createdAt || '')
      );
  }

  /**
   * Changes a user's role. Guards against locking the team out of the admin area.
   */
  async changeRole(
    actor: { uid: string; email: string },
    targetUid: string,
    newRole: string
  ): Promise<TeamMember> {
    if (!(ASSIGNABLE_ROLES as readonly string[]).includes(newRole)) {
      throw httpError(400, `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}.`);
    }

    if (targetUid === actor.uid) {
      throw httpError(400, "You can't change your own role. Ask another admin to do it.");
    }

    const target = await this.userRepository.findById(targetUid);
    if (!target) {
      throw httpError(404, 'That user was not found.');
    }

    if (isOwnerEmail(target.email)) {
      throw httpError(
        400,
        "This account is set as an owner in the server settings (ADMIN_EMAILS), so its role can't be changed here."
      );
    }

    if (target.role === newRole) {
      return toTeamMember(target, actor.uid);
    }

    // Never remove the last admin
    if (target.role === 'ADMIN' && newRole !== 'ADMIN') {
      const admins = await this.userRepository.countByRole('ADMIN');
      if (admins <= 1) {
        throw httpError(400, 'At least one admin is required. Make someone else an admin first.');
      }
    }

    const updated = await this.userRepository.updateRole(targetUid, newRole as UserRole, actor.email);
    if (!updated) {
      throw httpError(500, 'Failed to update the role.');
    }

    logger.info(`🔑 ${actor.email} changed the role of ${target.email}: ${target.role} -> ${newRole}`);
    return toTeamMember(updated, actor.uid);
  }
}
