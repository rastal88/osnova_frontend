import { describe, expect, it } from 'vitest';

import { canChangeRole, canManage } from './permissions';

const root = {
  id: 'r',
  role: 'root',
  permissions: ['admin.access', 'users.read', 'users.block', 'users.roles'],
};
const moderator = {
  id: 'm',
  role: 'moderator',
  permissions: ['admin.access', 'users.read', 'users.block'],
};
const user = { id: 'u', role: 'user', permissions: [] };

describe('canManage', () => {
  it('lets someone who changes roles manage everyone but root and themselves', () => {
    expect(canManage(root, user)).toBe(true);
    expect(canManage(root, moderator)).toBe(true);
    expect(canManage(root, root)).toBe(false);
    expect(canManage(root, { ...root, id: 'r2' })).toBe(false);
  });

  it('lets someone who only blocks manage ordinary users', () => {
    expect(canManage(moderator, user)).toBe(true);
    expect(canManage(moderator, { ...moderator, id: 'm2' })).toBe(false);
    expect(canManage(moderator, { id: 's', role: 'sales' })).toBe(false);
    expect(canManage(moderator, moderator)).toBe(false);
  });

  it('needs the permission to block', () => {
    const reader = { id: 'x', role: 'support', permissions: ['admin.access', 'users.read'] };
    expect(canManage(reader, user)).toBe(false);
    const hr = { id: 'h', role: 'hr', permissions: ['users.roles'] };
    expect(canManage(hr, user)).toBe(false);
    expect(canChangeRole(hr, user)).toBe(true);
  });

  it('gives nothing to a guest', () => {
    expect(canManage(null, user)).toBe(false);
  });
});

describe('canChangeRole', () => {
  it('needs the permission to change roles', () => {
    expect(canChangeRole(root, user)).toBe(true);
    expect(canChangeRole(root, root)).toBe(false);
    expect(canChangeRole(moderator, user)).toBe(false);
  });
});
