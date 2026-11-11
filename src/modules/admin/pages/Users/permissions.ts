import { type Permission, can } from '../../../auth';

interface Account {
  id: string;
  role: string;
  permissions?: Permission[];
}

/**
 * The backend rules, mirrored to show only the actions that will work: nobody
 * changes their own account or root; an account with a role other than "user"
 * is managed only by those who may change roles.
 */
function mayTouch(me: Account | null, user: Account): me is Account {
  if (!me || me.id === user.id || user.role === 'root') return false;
  return user.role === 'user' || can(me, 'users.roles');
}

/** Block and unblock. */
export function canManage(me: Account | null, user: Account): boolean {
  return mayTouch(me, user) && can(me, 'users.block');
}

export function canChangeRole(me: Account | null, user: Account): boolean {
  return mayTouch(me, user) && can(me, 'users.roles');
}
