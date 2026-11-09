import { describe, expect, it } from 'vitest';

import { utc } from './dates';

describe('utc', () => {
  it('adds the UTC marker only when there is no offset', () => {
    expect(utc('2026-11-09T19:48:32')).toBe('2026-11-09T19:48:32Z');
    expect(utc('2026-11-09T19:48:32Z')).toBe('2026-11-09T19:48:32Z');
    expect(utc('2026-11-09T19:48:32+03:00')).toBe('2026-11-09T19:48:32+03:00');
  });
});
