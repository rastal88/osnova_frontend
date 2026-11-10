import { describe, expect, it } from 'vitest';

import { areaOfPath, landingPath, otherArea } from './areas';

describe('landingPath', () => {
  it('opens the first area of the user', () => {
    expect(landingPath({ areas: ['admin', 'user'] })).toBe('/admin');
    expect(landingPath({ areas: ['user'] })).toBe('/');
  });

  it('falls back to home', () => {
    expect(landingPath(null)).toBe('/');
    expect(landingPath({ areas: [] })).toBe('/');
  });
});

describe('areaOfPath', () => {
  it('treats /admin and its pages as the admin area', () => {
    expect(areaOfPath('/admin')).toBe('admin');
    expect(areaOfPath('/admin/users')).toBe('admin');
    expect(areaOfPath('/administration')).toBe('user');
    expect(areaOfPath('/')).toBe('user');
  });
});

describe('otherArea', () => {
  it('switches between admin and client for admin roles', () => {
    expect(otherArea('/', ['admin', 'user'])).toBe('admin');
    expect(otherArea('/files', ['admin', 'user'])).toBe('admin');
    expect(otherArea('/admin', ['admin', 'user'])).toBe('user');
  });

  it('offers nothing when the user has one area', () => {
    // An ordinary user never sees the switch to the admin area
    expect(otherArea('/', ['user'])).toBeUndefined();
  });
});
