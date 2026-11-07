import { describe, expect, it } from 'vitest';

import { findActiveNavPath, getBreadcrumbs, navigationConfig } from './navigation';

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
