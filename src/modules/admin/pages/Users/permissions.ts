import { type Permission, can } from '../../../auth';
import { covers } from '../../access';

interface Account {
  id: string;
  role: string;
  /** Ids of the groups the account is in */
  groups?: string[];
  /** Everything the account may do: its role and its groups */
  permissions?: Permission[];
}

/**
 * The backend rules, mirrored to show only the actions that will work: nobody
 * changes their own account or root, or an account that may do more than they
 * can; an account with a role other than "user" or in a group is managed only by
 * those who may change roles.
 */
function mayTouch(me: Account | null, user: Account): me is Account {
  if (!me || me.id === user.id || user.role === 'root') return false;
  if (!covers(me, user.permissions ?? [])) return false;
  return (user.role === 'user' && !user.groups?.length) || can(me, 'users.roles');
}

/** Block and unblock. */
export function canManage(me: Account | null, user: Account): boolean {
  return mayTouch(me, user) && can(me, 'users.block');
}

/** Give a role and groups. */
export function canChangeRole(me: Account | null, user: Account): boolean {
  return mayTouch(me, user) && can(me, 'users.roles');
}
