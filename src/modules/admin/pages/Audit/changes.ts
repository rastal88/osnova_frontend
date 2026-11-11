/** One line of a record: a field that changed, or a filter of an export. */
export interface ChangeLine {
  field: string;
  before?: string;
  after?: string;
  /** For a value that did not change from something (e.g. an export filter) */
  value?: string;
}

/** Text of a stored value of a field. */
export type ValueText = (field: string, value: unknown) => string;

/**
 * Values as text: lists joined, yes / no; `name` gives known strings their names
 * (e.g. role slugs), also inside lists.
 */
export function plainText(
  yes: string,
  no: string,
  name: (field: string, value: string) => string = (_, value) => value,
  empty = '—',
): ValueText {
  const text: ValueText = (field, value) => {
    if (value === null || value === undefined || value === '') return empty;
    if (typeof value === 'boolean') return value ? yes : no;
    if (Array.isArray(value)) {
      return value.length ? value.map((item) => text(field, item)).join(', ') : empty;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return typeof value === 'string' ? name(field, value) : String(value);
  };
  return text;
}

/**
 * The `changes` of an audit record as lines: `{field: [before, after]}` for a change
 * (backend: app/modules/admin/audit.py), any other value for an export filter.
 */
export function changeLines(
  changes: Record<string, unknown> | null | undefined,
  text: ValueText,
): ChangeLine[] {
  return Object.entries(changes ?? {}).map(([field, value]) =>
    Array.isArray(value) && value.length === 2
      ? { field, before: text(field, value[0]), after: text(field, value[1]) }
      : { field, value: text(field, value) },
  );
}
