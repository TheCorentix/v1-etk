import { env } from './env';

// ---------------------------------------------------------------------------
// Roles & permissions. This file is the single source of truth: the API checks
// permissions with it, and the admin "Roles & Permissions" tab renders from it.
// ---------------------------------------------------------------------------

export const PERMISSIONS = [
  'dashboard.view',
  'products.manage',
  'orders.manage',
  'customisations.manage',
  'content.manage',
  'settings.manage',
  'roles.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_INFO: Record<Permission, { label: string; description: string }> = {
  'dashboard.view': {
    label: 'Analytics',
    description: 'View the analytics dashboard (sales, orders and request counts).',
  },
  'products.manage': {
    label: 'Catalog products',
    description: 'Add, edit and delete products.',
  },
  'orders.manage': {
    label: 'Orders',
    description: 'View all orders, update their status and tracking, and resend WhatsApp updates.',
  },
  'customisations.manage': {
    label: 'Styling requests',
    description: 'View and edit customisation and tailoring requests, change their status and add comments.',
  },
  'content.manage': {
    label: 'Website content',
    description: 'Homepage banners and sections, Look & Shop, reviews, categories and the media library.',
  },
  'settings.manage': {
    label: 'Store settings',
    description: 'Change store details, shipping and footer settings.',
  },
  'roles.manage': {
    label: 'Roles & permissions',
    description: 'Give team members a role and change what they can access.',
  },
};

/** Roles that give access to the admin area. Customers have none. */
export const STAFF_ROLES = ['ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** Every role that can be assigned from the admin panel (CUSTOMER = no staff access). */
export const ASSIGNABLE_ROLES = [...STAFF_ROLES, 'CUSTOMER'] as const;

export const ROLE_INFO: Record<StaffRole, { label: string; description: string; permissions: Permission[] }> = {
  ADMIN: {
    label: 'Admin',
    description: 'Full access to everything, including roles and permissions.',
    permissions: [...PERMISSIONS],
  },
  CONTENT_MANAGER: {
    label: 'Content Manager',
    description: 'Looks after the catalog and website content. No access to orders, customer requests or settings.',
    permissions: ['products.manage', 'content.manage'],
  },
  ORDER_MANAGER: {
    label: 'Order Manager',
    description: 'Handles orders and customer styling requests. No access to the catalog, website content or settings.',
    permissions: ['dashboard.view', 'orders.manage', 'customisations.manage'],
  },
};

const isStaffRole = (role: string | undefined | null): role is StaffRole =>
  !!role && (STAFF_ROLES as readonly string[]).includes(role);

/** Permissions granted by a role. Customers and any unrecognised role get none. */
export const permissionsFor = (role: string | undefined | null): Permission[] =>
  isStaffRole(role) ? ROLE_INFO[role].permissions : [];

export const hasPermission = (role: string | undefined | null, permission: Permission): boolean =>
  permissionsFor(role).includes(permission);

export const isStaff = (role: string | undefined | null): boolean => isStaffRole(role);

export const roleLabel = (role: string | undefined | null): string =>
  isStaffRole(role) ? ROLE_INFO[role].label : 'Customer';

// Emails listed in ADMIN_EMAILS always have the ADMIN role (they are re-elevated on login),
// so their role can't be changed from the admin panel.
const ownerEmails = new Set(
  env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
);

export const isOwnerEmail = (email: string | undefined | null): boolean =>
  !!email && ownerEmails.has(email.toLowerCase());
