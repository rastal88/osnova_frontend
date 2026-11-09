import { describe, expect, it } from 'vitest';

import { canChangeRole, canManage } from './permissions';

const root = { id: 'r', role: 'root' as const };
const moderator = { id: 'm', role: 'moderator' as const };
const user = { id: 'u', role: 'user' as const };

describe('canManage', () => {
  it('lets root manage everyone but root and itself', () => {
    expect(canManage(root, user)).toBe(true);
    expect(canManage(root, moderator)).toBe(true);
    expect(canManage(root, root)).toBe(false);
  });

  it('lets a moderator manage ordinary users only', () => {
    expect(canManage(moderator, user)).toBe(true);
    expect(canManage(moderator, { id: 'm2', role: 'moderator' })).toBe(false);
    expect(canManage(moderator, moderator)).toBe(false);
  });

  it('gives nothing to a guest', () => {
    expect(canManage(null, user)).toBe(false);
  });
});

describe('canChangeRole', () => {
  it('is for root only', () => {
    expect(canChangeRole(root, user)).toBe(true);
    expect(canChangeRole(moderator, user)).toBe(false);
  });
});
