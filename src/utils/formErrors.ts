import type { FormInstance } from 'antd';

import { getApiError } from '../api/errors';

/**
 * Shows per-field server errors (422 `fields`) under the matching form fields.
 * Nested fields come as "params.chat_id" and match the form path ['params', 'chat_id'].
 * Returns false when the error has none for these fields, so the caller shows
 * a general message instead.
 */
export function setServerFieldErrors(
  form: FormInstance,
  error: unknown,
  fieldNames: string[],
): boolean {
  const known = new Set(fieldNames);
  const fieldErrors = (getApiError(error)?.fields ?? []).filter((item) => known.has(item.field));
  if (fieldErrors.length === 0) return false;

  const path = (field: string) => field.split('.');
  form.setFields(fieldErrors.map((item) => ({ name: path(item.field), errors: [item.message] })));
  form.scrollToField(path(fieldErrors[0].field));
  return true;
}
