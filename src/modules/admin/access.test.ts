import { describe, expect, it } from 'vitest';

import type { GroupRead, RoleRead } from '../../api/generated';
import {
  accountPermissions,
  canDeleteRole,
  canEditGroup,
  canEditRole,
  canGiveRole,
  covers,
  permissionsOf,
} from './access';

const role = (slug: string, permissions: string[], extra: Partial<RoleRead> = {}): RoleRead => ({
  slug,
  name: slug,
  permissions,
  system: false,
  users: 0,
  ...extra,
});

const roles = [
  role('root', ['leads.read', 'roles.manage', 'users.roles'], { system: true, users: 1 }),
  role('moderator', ['leads.read'], { system: true }),
  role('sales', ['leads.read', 'leads.export']),
  role('support', ['users.read'], { users: 2 }),
];
const [root, moderator, sales, support] = roles;
const group: GroupRead = { id: 'g', name: 'Team', roles: ['sales'], users: 3 };

// Manages roles, may read and export leads, but not users
const manager = { permissions: ['roles.manage', 'leads.read', 'leads.export'] };

describe('covers', () => {
  it('is true only when every permission is there', () => {
    expect(covers(manager, ['leads.read', 'leads.export'])).toBe(true);
    expect(covers(manager, [])).toBe(true);
    expect(covers(manager, ['users.read'])).toBe(false);
    expect(covers(null, ['leads.read'])).toBe(false);
  });
});

describe('permissionsOf and accountPermissions', () => {
  it('joins the permissions of the roles without repeats', () => {
    expect(permissionsOf(['moderator', 'sales'], roles).sort()).toEqual([
      'leads.export',
      'leads.read',
    ]);
    expect(permissionsOf(['unknown'], roles)).toEqual([]);
  });

  it('gives a user their role and the roles of their groups', () => {
    const user = { role: 'support', groups: ['g'] };
    expect(accountPermissions(user, roles, [group]).sort()).toEqual([
      'leads.export',
      'leads.read',
      'users.read',
    ]);
    expect(accountPermissions({ role: 'user' }, roles, [group])).toEqual([]);
  });
});

describe('roles', () => {
  it('are edited with roles.manage and every permission in them', () => {
    expect(canEditRole(manager, sales)).toBe(true);
    expect(canEditRole(manager, moderator)).toBe(true);
    expect(canEditRole(manager, support)).toBe(false);
    expect(canEditRole({ permissions: ['leads.read', 'leads.export'] }, sales)).toBe(false);
  });

  it('never let root be edited, even by root', () => {
    expect(canEditRole({ permissions: root.permissions }, root)).toBe(false);
  });

  it('are deleted when not built in and nobody has them', () => {
    expect(canDeleteRole(manager, sales)).toBe(true);
    expect(canDeleteRole(manager, moderator)).toBe(false);
    const all = { permissions: ['roles.manage', 'users.read'] };
    expect(canDeleteRole(all, support)).toBe(false);
  });

  it('are given when covered, root never', () => {
    expect(canGiveRole(manager, sales)).toBe(true);
    expect(canGiveRole(manager, support)).toBe(false);
    expect(canGiveRole({ permissions: root.permissions }, root)).toBe(false);
  });
});

describe('groups', () => {
  it('are edited with roles.manage and every permission of their roles', () => {
    expect(canEditGroup(manager, group, roles)).toBe(true);
    expect(canEditGroup(manager, { ...group, roles: ['support'] }, roles)).toBe(false);
    expect(canEditGroup({ permissions: ['leads.read', 'leads.export'] }, group, roles)).toBe(false);
  });
});
