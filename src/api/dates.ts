/** The backend sends UTC times without an offset; mark them as UTC before formatting. */
export function utc(value: string): string {
  return /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
}
