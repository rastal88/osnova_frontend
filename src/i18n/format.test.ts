import { describe, expect, it } from 'vitest';

import { createFormatters } from './format';

// Intl output may use narrow or non-breaking spaces depending on the runtime
const plain = (text: string) => text.replace(/[  ]/g, ' ');

describe('createFormatters', () => {
  const en = createFormatters('en');
  const ru = createFormatters('ru');
  const date = new Date(2026, 10, 7, 14, 30);

  it('formats dates for the language', () => {
    expect(en.date(date)).toBe('Nov 7, 2026');
    expect(plain(ru.date(date))).toBe('7 нояб. 2026 г.');
    expect(en.date('2026-11-07T00:00:00', { month: 'long' })).toBe('November');
  });

  it('formats numbers and money', () => {
    expect(en.number(1250.5)).toBe('1,250.5');
    expect(plain(ru.number(1250.5))).toBe('1 250,5');
    expect(en.currency(1250)).toBe('$1,250.00');
    expect(en.currency(10, 'EUR')).toBe('€10.00');
    expect(en.percent(0.256)).toBe('26%');
    expect(en.percent(0.256, 1)).toBe('25.6%');
    expect(en.compact(1_500_000)).toBe('1.5M');
  });

  it('picks the largest unit for relative time', () => {
    const now = new Date(2026, 10, 7, 12, 0);
    expect(en.relative(new Date(2026, 10, 4, 12, 0), now)).toBe('3 days ago');
    expect(en.relative(new Date(2026, 10, 7, 14, 0), now)).toBe('in 2 hours');
    expect(en.relative(new Date(2026, 10, 6, 12, 0), now)).toBe('yesterday');
    expect(en.relative(now, now)).toBe('now');
    expect(ru.relative(new Date(2026, 10, 4, 12, 0), now)).toBe('3 дня назад');
  });
});
