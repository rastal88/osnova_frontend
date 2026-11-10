/** Bar heights in percent of the tallest one; all zero when there is no data. */
export function barHeights(values: number[]): number[] {
  const max = Math.max(0, ...values);
  return values.map((value) => (max > 0 ? Math.round((value / max) * 100) : 0));
}
