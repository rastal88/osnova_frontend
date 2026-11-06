import {
  AppstoreOutlined,
  DashboardOutlined,
  HomeOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ParseKeys } from 'i18next';
import type { ComponentType } from 'react';

import type { BootstrapFeatures } from '../api/bootstrap';

export type Capability = keyof BootstrapFeatures;
export type MenuPosition = 'top' | 'left' | 'right';

/** A key in the `common` namespace, translated where it is shown. */
export type LabelKey = ParseKeys<'common'>;

export interface NavItem {
  path: string;
  label: LabelKey;
  icon?: ComponentType;
  capability?: Capability;
  /** Shown only to signed-in users (and only to these roles, when set) */
  requiresAuth?: boolean;
  roles?: string[];
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
  position: 'top',
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
      path: '/contact',
      label: 'pages.contact',
      icon: MailOutlined,
    },
    {
      path: '/dashboard',
      label: 'pages.dashboard',
      icon: DashboardOutlined,
      capability: 'authentication',
      requiresAuth: true,
    },
    {
      path: '/admin',
      label: 'pages.admin',
      icon: SettingOutlined,
      capability: 'admin',
      requiresAuth: true,
      roles: ['root', 'moderator'],
    },
  ],
};

export const routeTitles: Record<string, LabelKey> = {
  '/': 'pages.home',
  '/contact': 'pages.contact',
  '/examples': 'pages.examples',
  '/examples/data': 'pages.exampleData',
  '/dashboard': 'pages.dashboard',
  '/profile': 'pages.profile',
  '/login': 'pages.login',
  '/register': 'pages.register',
  '/admin': 'pages.admin',
  '/admin/dashboard': 'pages.overview',
  '/admin/profile': 'pages.profile',
  '/admin/users': 'pages.users',
  '/admin/other': 'pages.other',
};

export const redirects: { from: string; to: string }[] = [
  { from: '/home', to: '/' },
];

export function findActiveNavPath(
  pathname: string,
  items: NavItem[],
): string | undefined {
  return items
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

  return crumbs;
}
