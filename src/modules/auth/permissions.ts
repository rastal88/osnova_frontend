import { useAuthStore } from './authStore';

/**
 * A named action the backend allows, e.g. "leads.read" (backend README → Permissions).
 * The user's list comes with the account (`permissions`); the backend checks every
 * request anyway, here they only hide what would not work.
 */
export type Permission = string;

interface Account {
  permissions?: Permission[];
}

/** True when the user has every one of the permissions. */
export function can(user: Account | null | undefined, ...permissions: Permission[]): boolean {
  const granted = user?.permissions ?? [];
  return permissions.every((permission) => granted.includes(permission));
}

/** `can` for the signed-in user: `const canExport = useCan('leads.export')`. */
export function useCan(...permissions: Permission[]): boolean {
  return useAuthStore((state) => can(state.user, ...permissions));
}
