const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** 1536 → "1.5 KB", in the given number format. */
export function formatSize(bytes: number, number: (value: number) => string): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? value : Math.round(value * 10) / 10;
  return `${number(rounded)} ${UNITS[unit]}`;
}
