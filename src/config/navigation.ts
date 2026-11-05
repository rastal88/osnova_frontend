import {
  DashboardOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';

import type { BootstrapFeatures } from '../api/bootstrap';

export type Capability = keyof BootstrapFeatures;
export type MenuPosition = 'top' | 'left' | 'right';

export interface NavItem {
  path: string;
  label: string;
  icon?: ComponentType;
  capability?: Capability;
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

export const navigationConfig: NavigationConfig = {
  enabled: true,
  position: 'top',
  showBrand: true,
  showBreadcrumbs: true,
  items: [
    {
      path: '/',
      label: 'Home',
      icon: HomeOutlined,
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: DashboardOutlined,
      capability: 'authentication',
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: SettingOutlined,
      capability: 'admin',
    },
  ],
};

export const routeTitles: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/login': 'Login',
  '/register': 'Register',
  '/admin': 'Admin',
  '/admin/dashboard': 'Overview',
  '/admin/profile': 'Profile',
  '/admin/users': 'Users',
  '/admin/other': 'Other',
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

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') {
    return [];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];
  let current = '';

  for (const segment of segments) {
    current += `/${segment}`;
    const title = routeTitles[current];
    if (title) {
      crumbs.push({ title, path: current });
    }
  }

  return crumbs;
}
