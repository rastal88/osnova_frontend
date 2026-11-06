import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CURRENCY } from '../config/format';

/**
 * Locale-aware formatting of dates, numbers and money with the built-in Intl API
 * (no date or number libraries). Use the hook in components:
 *
 *   const format = useFormat();
 *   format.date(order.createdAt);      // "Nov 7, 2026" / "7 нояб. 2026 г."
 *   format.currency(order.total);      // "$1,250.00" / "1 250,00 $"
 *   format.relative(comment.createdAt) // "3 days ago" / "3 дня назад"
 */
export type DateInput = Date | string | number;

export interface Formatters {
  language: string;
  date: (value: DateInput, options?: Intl.DateTimeFormatOptions) => string;
  dateTime: (value: DateInput) => string;
  time: (value: DateInput) => string;
  relative: (value: DateInput, now?: DateInput) => string;
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  percent: (value: number, fractionDigits?: number) => string;
  compact: (value: number) => string;
  currency: (value: number, currency?: string) => string;
}

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

const SECOND = 1000;
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600 * SECOND],
  ['month', 30 * 24 * 3600 * SECOND],
  ['week', 7 * 24 * 3600 * SECOND],
  ['day', 24 * 3600 * SECOND],
  ['hour', 3600 * SECOND],
  ['minute', 60 * SECOND],
  ['second', SECOND],
];

export function createFormatters(language: string): Formatters {
  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium' });
  const dateTimeFormat = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const timeFormat = new Intl.DateTimeFormat(language, { timeStyle: 'short' });
  const relativeFormat = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  const numberFormat = new Intl.NumberFormat(language);
  const compactFormat = new Intl.NumberFormat(language, { notation: 'compact' });

  return {
    language,
    date: (value, options) =>
      (options ? new Intl.DateTimeFormat(language, options) : dateFormat).format(toDate(value)),
    dateTime: (value) => dateTimeFormat.format(toDate(value)),
    time: (value) => timeFormat.format(toDate(value)),
    relative: (value, now = Date.now()) => {
      const diff = toDate(value).getTime() - toDate(now).getTime();
      const [unit, size] =
        RELATIVE_UNITS.find(([, unitSize]) => Math.abs(diff) >= unitSize) ?? ['second', SECOND];
      return relativeFormat.format(Math.round(diff / size), unit);
    },
    number: (value, options) =>
      (options ? new Intl.NumberFormat(language, options) : numberFormat).format(value),
    percent: (value, fractionDigits = 0) =>
      new Intl.NumberFormat(language, {
        style: 'percent',
        maximumFractionDigits: fractionDigits,
      }).format(value),
    compact: (value) => compactFormat.format(value),
    currency: (value, currency = DEFAULT_CURRENCY) =>
      new Intl.NumberFormat(language, { style: 'currency', currency }).format(value),
  };
}

/** Formatters for the current interface language. */
export function useFormat(): Formatters {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return useMemo(() => createFormatters(language), [language]);
}
