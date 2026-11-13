import { AppstoreOutlined, FolderOutlined, HomeOutlined } from '@ant-design/icons';
import type { ParseKeys } from 'i18next';
import type { ComponentType } from 'react';

import type { BootstrapFeatures } from '../api/bootstrap';

export type Capability = keyof BootstrapFeatures;
/** Areas of the app (the backend sends a user's areas); the core's own type, so it does
 * not depend on the auth module's API types (`npm run strip` may remove them) */
export type Area = 'admin' | 'user';
export type MenuPosition = 'top' | 'left' | 'right';

/** A key in the `common` namespace, translated where it is shown. */
export type LabelKey = ParseKeys<'common'>;

export interface NavItem {
  /** Page of the item; for a group with `children`, only a key (the group opens no page) */
  path: string;
  label: LabelKey;
  icon?: ComponentType;
  capability?: Capability;
  /** Shown only to signed-in users (and only to those who have this area, when set) */
  requiresAuth?: boolean;
  area?: Area;
  /** Shown only to users who have this permission, e.g. 'leads.read' */
  permission?: string;
  /** A submenu, e.g. Settings → General / Channels */
  children?: NavItem[];
}

export interface NavigationConfig {
  enabled: boolean;
  position: MenuPosition;
  showBrand: boolean;
  showBreadcrumbs: boolean;
  items: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  path: string;
}

export interface RouteCrumb {
  titleKey: LabelKey;
  path: string;
}

export const navigationConfig: NavigationConfig = {
  enabled: true,
  position: 'left',
  showBrand: true,
  showBreadcrumbs: true,
  items: [
    {
      path: '/',
      label: 'pages.home',
      icon: HomeOutlined,
    },
    {
      path: '/examples',
      label: 'pages.examples',
      icon: AppstoreOutlined,
    },
    {
      path: '/files',
      label: 'pages.files',
      icon: FolderOutlined,
      capability: 'files',
      requiresAuth: true,
      area: 'user',
    },
  ],
};

export const routeTitles: Record<string, LabelKey> = {
  '/': 'pages.home',
  '/examples': 'pages.examples',
  '/examples/data': 'pages.exampleData',
  '/examples/landing': 'pages.exampleLanding',
  '/examples/contact': 'pages.contact',
  '/privacy': 'pages.privacy',
  '/terms': 'pages.terms',
  '/cookies': 'pages.cookies',
  '/profile': 'pages.profile',
  '/files': 'pages.files',
  '/login': 'pages.login',
  '/register': 'pages.register',
  '/admin': 'pages.admin',
  '/admin/audit': 'pages.audit',
  '/admin/groups': 'pages.groups',
  '/admin/leads': 'pages.leads',
  '/admin/roles': 'pages.roles',
  '/admin/settings': 'pages.settings',
  '/admin/settings/site': 'pages.settingsSite',
  '/admin/settings/languages': 'pages.settingsLanguages',
  '/admin/settings/mail': 'pages.settingsMail',
  '/admin/settings/protection': 'pages.settingsProtection',
  '/admin/settings/retention': 'pages.settingsRetention',
  '/admin/settings/files': 'pages.settingsFiles',
  '/admin/settings/notifications': 'pages.settingsNotifications',
  '/admin/settings/channels': 'pages.channels',
  '/admin/users': 'pages.users',
};

/** Start pages of a section that have their own title, e.g. Admin / Overview. */
export const indexTitles: Record<string, LabelKey> = {
  '/admin': 'pages.overview',
};

export const redirects: { from: string; to: string }[] = [{ from: '/home', to: '/' }];

/**
 * Menu items for the current capabilities and user (guests see only public ones).
 * A group keeps only its visible children and is dropped when none is left.
 */
export function visibleNavItems(
  items: NavItem[],
  features: BootstrapFeatures | undefined,
  user: { areas: Area[]; permissions?: string[] } | null,
): NavItem[] {
  return items
    .filter(
      (item) =>
        (!item.capability || Boolean(features?.[item.capability])) &&
        (!item.requiresAuth || user !== null) &&
        (!item.area || Boolean(user?.areas.includes(item.area))) &&
        (!item.permission || Boolean(user?.permissions?.includes(item.permission))),
    )
    .map((item) =>
      item.children ? { ...item, children: visibleNavItems(item.children, features, user) } : item,
    )
    .filter((item) => !item.children || item.children.length > 0);
}

/** Items that open a page: groups are replaced by their children. */
export function navPages(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children ? navPages(item.children) : [item]));
}

/** Keys of the groups that contain the page at `path` (to open them in the menu). */
export function navGroupsOf(path: string | undefined, items: NavItem[]): string[] {
  return items
    .filter((item) => item.children && navPages(item.children).some((page) => page.path === path))
    .map((item) => item.path);
}

export function findActiveNavPath(pathname: string, items: NavItem[]): string | undefined {
  return navPages(items)
    .filter((item) =>
      item.path === '/'
        ? pathname === '/'
        : pathname === item.path || pathname.startsWith(`${item.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;
}

export function getBreadcrumbs(pathname: string): RouteCrumb[] {
  if (pathname === '/') {
    return [];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: RouteCrumb[] = [];
  let current = '';

  for (const segment of segments) {
    current += `/${segment}`;
    const titleKey = routeTitles[current];
    if (titleKey) {
      crumbs.push({ titleKey, path: current });
    }
  }

  const indexTitle = indexTitles[pathname];
  if (indexTitle) {
    crumbs.push({ titleKey: indexTitle, path: pathname });
  }

  return crumbs;
}
