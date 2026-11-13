import { describe, expect, it } from 'vitest';

import type { BootstrapFeatures } from '../api/bootstrap';
import {
  type NavItem,
  findActiveNavPath,
  getBreadcrumbs,
  navGroupsOf,
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
    { path: '/files', label: 'pages.files', requiresAuth: true, area: 'user' },
    { path: '/admin/users', label: 'pages.users', capability: 'admin', area: 'admin' },
  ];
  const features = { authentication: true, admin: true } as BootstrapFeatures;
  const paths = (user: Parameters<typeof visibleNavItems>[2], f = features) =>
    visibleNavItems(items, f, user).map((item) => item.path);

  it('shows guests only public items', () => {
    expect(paths(null)).toEqual(['/']);
  });

  it('shows items of the areas the user has', () => {
    expect(paths({ areas: ['user'] })).toEqual(['/', '/files']);
    expect(paths({ areas: ['admin', 'user'] })).toEqual(['/', '/files', '/admin/users']);
  });

  it('shows an item with a permission only to those who have it', () => {
    const leads: NavItem[] = [
      { path: '/admin/leads', label: 'pages.leads', permission: 'leads.read' },
    ];
    const visible = (permissions?: string[]) =>
      visibleNavItems(leads, features, { areas: ['admin', 'user'], permissions }).length;
    expect(visible(['leads.read'])).toBe(1);
    expect(visible(['users.read'])).toBe(0);
    expect(visible()).toBe(0);
  });

  it('hides items of disabled capabilities', () => {
    const noAdmin = { ...features, admin: false };
    expect(paths({ areas: ['admin', 'user'] }, noAdmin)).toEqual(['/', '/files']);
  });
});

describe('submenus', () => {
  const items: NavItem[] = [
    { path: '/admin', label: 'pages.overview' },
    {
      path: 'settings',
      label: 'pages.settings',
      children: [
        { path: '/admin/settings', label: 'pages.settings' },
        { path: '/admin/settings/channels', label: 'pages.channels', capability: 'admin' },
      ],
    },
  ];

  it('selects the page inside a group and opens the group', () => {
    expect(findActiveNavPath('/admin/settings/channels', items)).toBe('/admin/settings/channels');
    expect(findActiveNavPath('/admin/settings', items)).toBe('/admin/settings');
    expect(navGroupsOf('/admin/settings/channels', items)).toEqual(['settings']);
    expect(navGroupsOf('/admin', items)).toEqual([]);
  });

  it('hides children of disabled capabilities and empty groups', () => {
    const features = { admin: false } as BootstrapFeatures;
    const [, group] = visibleNavItems(items, features, null);
    expect(group.children?.map((item) => item.path)).toEqual(['/admin/settings']);

    const onlyHidden: NavItem[] = [
      { path: 'g', label: 'pages.settings', children: [{ ...items[0], requiresAuth: true }] },
    ];
    expect(visibleNavItems(onlyHidden, features, null)).toEqual([]);
  });
});

describe('getBreadcrumbs', () => {
  it('is empty on home', () => {
    expect(getBreadcrumbs('/')).toEqual([]);
  });

  it('names the start page of a section', () => {
    expect(getBreadcrumbs('/admin').map((crumb) => crumb.titleKey)).toEqual([
      'pages.admin',
      'pages.overview',
    ]);
    // The shared profile page has no admin parent
    expect(getBreadcrumbs('/profile').map((crumb) => crumb.titleKey)).toEqual(['pages.profile']);
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
    expect(getBreadcrumbs('/admin/settings/mail').map((crumb) => crumb.titleKey)).toEqual([
      'pages.admin',
      'pages.settings',
      'pages.settingsMail',
    ]);
  });
});
