import type { Role } from '../../../../api/generated';

interface Account {
  id: string;
  role: Role;
}

/**
 * The backend rules, mirrored to show only the actions that will work: nobody
 * changes their own account or root; a moderator manages ordinary users only.
 */
export function canManage(me: Account | null, user: Account): boolean {
  if (!me || me.id === user.id || user.role === 'root') return false;
  return me.role === 'root' || (me.role === 'moderator' && user.role === 'user');
}

/** Roles are changed by root only (to user or moderator). */
export function canChangeRole(me: Account | null, user: Account): boolean {
  return canManage(me, user) && me?.role === 'root';
}

/** The backend sends UTC times without an offset; mark them as UTC before formatting. */
export function utc(value: string): string {
  return /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
}
