import type { AccountDelete } from '../../../../api/generated';

/**
 * What confirms an account deletion: the account's own email (accounts that sign in
 * only with a provider have no password) or else the password.
 */
export function deleteConfirmation(typed: string, email: string): AccountDelete {
  return typed.trim().toLowerCase() === email.toLowerCase()
    ? { email: typed }
    : { password: typed };
}
