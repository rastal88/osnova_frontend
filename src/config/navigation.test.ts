import { describe, expect, it } from 'vitest';

import type { BootstrapFeatures } from '../api/bootstrap';
import {
  type NavItem,
  findActiveNavPath,
  getBreadcrumbs,
  navigationConfig,
  visibleNavItems,
} from './navigation';

describe('findActiveNavPath', () => {
  const items = navigationConfig.items;

  it('matches home only on the exact path', () => {
    expect(findActiveNavPath('/', items)).toBe('/');
    expect(findActiveNavPath('/unknown', items)).toBeUndefined();
  });

  it('matches nested pages to their section, not to a similar prefix', () => {
    expect(findActiveNavPath('/examples/data', items)).toBe('/examples');
    expect(findActiveNavPath('/examples-old', items)).toBeUndefined();
  });

  it('prefers the longest matching item', () => {
    const nested = [...items, { path: '/admin/users', label: 'pages.users' as const }];
    expect(findActiveNavPath('/admin/users/42', nested)).toBe('/admin/users');
  });
});

describe('visibleNavItems', () => {
  const items: NavItem[] = [
    { path: '/', label: 'pages.home' },
    { path: '/dashboard', label: 'pages.dashboard', requiresAuth: true, area: 'client' },
    { path: '/admin/users', label: 'pages.users', capability: 'admin', area: 'admin' },
  ];
  const features = { authentication: true, admin: true } as BootstrapFeatures;
  const paths = (user: Parameters<typeof visibleNavItems>[2], f = features) =>
    visibleNavItems(items, f, user).map((item) => item.path);

  it('shows guests only public items', () => {
    expect(paths(null)).toEqual(['/']);
  });

  it('shows items of the areas the user has', () => {
    expect(paths({ areas: ['client'] })).toEqual(['/', '/dashboard']);
    expect(paths({ areas: ['admin', 'client'] })).toEqual(['/', '/dashboard', '/admin/users']);
  });

  it('hides items of disabled capabilities', () => {
    const noAdmin = { ...features, admin: false };
    expect(paths({ areas: ['admin', 'client'] }, noAdmin)).toEqual(['/', '/dashboard']);
  });
});

describe('getBreadcrumbs', () => {
  it('is empty on home', () => {
    expect(getBreadcrumbs('/')).toEqual([]);
  });

  it('lists known parents and skips unknown segments', () => {
    expect(getBreadcrumbs('/examples/data')).toEqual([
      { titleKey: 'pages.examples', path: '/examples' },
      { titleKey: 'pages.exampleData', path: '/examples/data' },
    ]);
    expect(getBreadcrumbs('/admin/users/42')).toEqual([
      { titleKey: 'pages.admin', path: '/admin' },
      { titleKey: 'pages.users', path: '/admin/users' },
    ]);
  });
});
