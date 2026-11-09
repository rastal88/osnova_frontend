import { describe, expect, it } from 'vitest';

import { formatSize } from './size';

const en = (value: number) => new Intl.NumberFormat('en').format(value);
const ru = (value: number) => new Intl.NumberFormat('ru').format(value);

describe('formatSize', () => {
  it('picks the unit and keeps one decimal', () => {
    expect(formatSize(0, en)).toBe('0 B');
    expect(formatSize(1023, en)).toBe('1,023 B');
    expect(formatSize(1536, en)).toBe('1.5 KB');
    expect(formatSize(3_600_000, en)).toBe('3.4 MB');
    expect(formatSize(5 * 1024 ** 4, en)).toBe('5,120 GB');
  });

  it('uses the language number format', () => {
    expect(formatSize(1536, ru)).toBe('1,5 KB');
  });
});
