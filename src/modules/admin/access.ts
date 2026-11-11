/**
 * Roles and groups: the data the admin pages share and the backend rules, mirrored
 * to show only the actions that will work (backend: app/modules/admin/access.py).
 *
 * Nobody hands out, changes or takes away more than they have themselves: a role or
 * a group is changed only by someone with `roles.manage` who has every permission in
 * it; root has every permission and is not edited. The `user` role is given to every
 * new account, so it holds only permissions meant for everyone (`everyone`).
 */
import { useCallback, useEffect, useState } from 'react';

import type { GroupRead, PermissionRead, RoleRead } from '../../api/generated';
import { type Permission, can, isSystemRole, useRoleLabel } from '../auth';
import { getGroups, getRoles } from './api';

interface Account {
  permissions?: Permission[];
}

/** True when the account has every one of the permissions. */
export function covers(me: Account | null | undefined, permissions: Iterable<Permission>) {
  const granted = new Set(me?.permissions ?? []);
  return [...permissions].every((permission) => granted.has(permission));
}

/** Every permission the roles with these slugs give. */
export function permissionsOf(slugs: Iterable<string>, roles: RoleRead[]): Permission[] {
  const wanted = new Set(slugs);
  return [...new Set(roles.filter((role) => wanted.has(role.slug)).flatMap((r) => r.permissions))];
}

/** What a user may do: their own role and the roles of their groups. */
export function accountPermissions(
  user: { role: string; groups?: string[] },
  roles: RoleRead[],
  groups: GroupRead[],
): Permission[] {
  const mine = new Set(user.groups ?? []);
  const slugs = groups.filter((group) => mine.has(group.id)).flatMap((group) => group.roles);
  return permissionsOf([user.role, ...slugs], roles);
}

/** The role every new account gets. */
export const SIGN_UP_ROLE = 'user';

/** May `me` tick or untick this permission in this role? */
export function canGrant(
  me: Account | null | undefined,
  roleSlug: string | null,
  permission: Pick<PermissionRead, 'name' | 'everyone'>,
): boolean {
  if (roleSlug === SIGN_UP_ROLE && !permission.everyone) return false;
  return covers(me, [permission.name]);
}

export function canEditRole(me: Account | null | undefined, role: RoleRead): boolean {
  return can(me, 'roles.manage') && role.slug !== 'root' && covers(me, role.permissions);
}

/** Built-in roles and roles that users have are not deleted. */
export function canDeleteRole(me: Account | null | undefined, role: RoleRead): boolean {
  return canEditRole(me, role) && !role.system && role.users === 0;
}

export function canEditGroup(
  me: Account | null | undefined,
  group: GroupRead,
  roles: RoleRead[],
): boolean {
  return can(me, 'roles.manage') && covers(me, permissionsOf(group.roles, roles));
}

/** Roles that can be given to a user or a group: not root, and covered by `me`. */
export function canGiveRole(me: Account | null | undefined, role: RoleRead): boolean {
  return role.slug !== 'root' && covers(me, role.permissions);
}

function useList<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setItems(await load());
      setError(false);
    } catch {
      setError(true);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, error, reload };
}

/** The roles of the project (null while loading) and the name of a role by its slug. */
export function useRoles() {
  const { items: roles, error, reload } = useList(getRoles);
  const label = useRoleLabel();
  const roleName = useCallback(
    (slug: string) =>
      isSystemRole(slug) ? label(slug) : (roles?.find((role) => role.slug === slug)?.name ?? slug),
    [roles, label],
  );
  return { roles, error, reload, roleName };
}

/** The groups (null while loading). */
export function useGroups() {
  const { items: groups, error, reload } = useList(getGroups);
  return { groups, error, reload };
}
