import type { FormDescription, FormFieldDescription } from '../../../../api/generated';

/** A submitted value as text: option labels instead of codes, yes / no for checkboxes. */
export function formatValue(
  field: FormFieldDescription | undefined,
  value: unknown,
  yesNo: { yes: string; no: string },
): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? yesNo.yes : yesNo.no;
  const label = (code: unknown) =>
    field?.options.find((option) => option.value === code)?.label ?? String(code);
  if (Array.isArray(value)) return value.map(label).join(', ');
  return label(value);
}

const SUMMARY_TYPES = new Set(['text', 'email', 'tel']);

/** A short line for the table: the first few short text answers. */
export function leadSummary(
  form: FormDescription | undefined,
  data: Record<string, unknown>,
  limit = 3,
): string {
  const names = form
    ? form.fields.filter((field) => SUMMARY_TYPES.has(field.type)).map((field) => field.name)
    : Object.keys(data);
  return names
    .map((name) => data[name])
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .slice(0, limit)
    .join(' · ');
}
