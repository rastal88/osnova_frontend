import { describe, expect, it } from 'vitest';

import { can } from './permissions';

describe('can', () => {
  const user = { permissions: ['admin.access', 'leads.read'] };

  it('needs every permission that is asked', () => {
    expect(can(user, 'leads.read')).toBe(true);
    expect(can(user, 'admin.access', 'leads.read')).toBe(true);
    expect(can(user, 'leads.read', 'leads.export')).toBe(false);
  });

  it('gives nothing to a guest or an account without permissions', () => {
    expect(can(null, 'leads.read')).toBe(false);
    expect(can({}, 'leads.read')).toBe(false);
  });
});
