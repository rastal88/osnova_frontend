import { describe, expect, it } from 'vitest';

import { areaOfPath, landingPath, otherArea } from './areas';

describe('landingPath', () => {
  it('opens the first area of the user', () => {
    expect(landingPath({ areas: ['admin', 'client'] })).toBe('/admin');
    expect(landingPath({ areas: ['client'] })).toBe('/dashboard');
  });

  it('falls back to home', () => {
    expect(landingPath(null)).toBe('/');
    expect(landingPath({ areas: [] })).toBe('/');
  });
});

describe('areaOfPath', () => {
  it('treats /admin and its pages as the admin area', () => {
    expect(areaOfPath('/admin')).toBe('admin');
    expect(areaOfPath('/admin/profile')).toBe('admin');
    expect(areaOfPath('/administration')).toBe('client');
    expect(areaOfPath('/')).toBe('client');
  });
});

describe('otherArea', () => {
  it('switches between admin and client for admin roles', () => {
    expect(otherArea('/dashboard', ['admin', 'client'])).toBe('admin');
    expect(otherArea('/admin', ['admin', 'client'])).toBe('client');
  });

  it('offers nothing when the user has one area', () => {
    expect(otherArea('/dashboard', ['client'])).toBeUndefined();
  });
});
