import { BarChart2, ShoppingBag, FileText, Scissors, Film, Sliders, Layers, Star, Settings, ShieldCheck } from 'lucide-react';

// The admin sidebar tabs and the permission each one needs. Permission keys come from the server
// (server/src/config/permissions.ts); the server enforces them too, so hiding a tab is only a convenience.
export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Analytics', icon: BarChart2, permission: 'dashboard.view' },
  { id: 'products', label: 'Catalog Products', icon: ShoppingBag, permission: 'products.manage' },
  { id: 'orders', label: 'Order Status', icon: FileText, permission: 'orders.manage' },
  { id: 'customizations', label: 'Styling requests', icon: Scissors, permission: 'customisations.manage' },
  { id: 'lookbook', label: 'Look & Shop', icon: Film, permission: 'content.manage' },
  { id: 'cms', label: 'Homepage CMS', icon: Sliders, permission: 'content.manage' },
  { id: 'categories', label: 'Categories & Collections', icon: Layers, permission: 'content.manage' },
  { id: 'testimonials', label: 'Draped in Love (Reviews)', icon: Star, permission: 'content.manage' },
  { id: 'settings', label: 'Store Settings', icon: Settings, permission: 'settings.manage' },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck, permission: 'roles.manage' },
];

/** The tabs a user may open, given a `hasPermission(permission)` function. */
export const tabsFor = (hasPermission) => ADMIN_TABS.filter((tab) => hasPermission(tab.permission));
