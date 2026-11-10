import { describe, expect, it, vi } from 'vitest';

// The shared client reads the browser location and the i18n setup; not needed here
vi.mock('./axios', () => ({ default: {} }));

import { fileNameFrom } from './download';

describe('fileNameFrom', () => {
  it('reads a quoted or a bare name', () => {
    expect(fileNameFrom('attachment; filename="leads-2026-01-31.csv"')).toBe(
      'leads-2026-01-31.csv',
    );
    expect(fileNameFrom('attachment; filename=users.csv')).toBe('users.csv');
  });

  it('prefers the encoded name', () => {
    const header = 'attachment; filename="x.csv"; filename*=UTF-8\'\'%D0%BB%D0%B8%D0%B4%D1%8B.csv';
    expect(fileNameFrom(header)).toBe('лиды.csv');
    expect(fileNameFrom('attachment; filename="x.csv"; filename*=UTF-8\'\'%E0%A4%A')).toBe('x.csv');
  });

  it('gives nothing without a name', () => {
    expect(fileNameFrom(undefined)).toBeNull();
    expect(fileNameFrom('inline')).toBeNull();
  });
});
