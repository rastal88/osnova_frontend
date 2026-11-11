import type { FormRule } from 'antd';
import type { TFunction } from 'i18next';

import type { FormFieldDescription } from '../../api/forms';

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : value);

const PATTERN_MESSAGES = {
  email: 'validation.email',
  tel: 'validation.phone',
} as const;

/** Client rules mirror the server ones, so most mistakes are caught before sending. */
export function rulesFor(field: FormFieldDescription, t: TFunction<'forms'>): FormRule[] {
  if (field.type === 'multiselect') {
    const min = Math.max(field.min_length ?? 0, field.required ? 1 : 0);
    return min ? [{ type: 'array', min, message: t('validation.chooseAtLeast', { min }) }] : [];
  }
  if (field.type === 'number') {
    const rules: FormRule[] = [];
    if (field.required) rules.push({ required: true, message: t('validation.required') });
    if (field.min_value != null) {
      rules.push({
        type: 'number',
        min: field.min_value,
        message: t('validation.min', { min: field.min_value }),
      });
    }
    if (field.max_value != null) {
      rules.push({
        type: 'number',
        max: field.max_value,
        message: t('validation.max', { max: field.max_value }),
      });
    }
    return rules;
  }
  if (field.type === 'checkbox' || field.type === 'consent') {
    if (!field.required) return [];
    return [
      {
        validator: (_, value) =>
          value ? Promise.resolve() : Promise.reject(new Error(t('validation.mustBeChecked'))),
      },
    ];
  }

  const rules: FormRule[] = [];
  if (field.required) {
    rules.push({
      required: true,
      whitespace: true,
      message: t('validation.required'),
    });
  }
  if (field.min_length) {
    rules.push({
      min: field.min_length,
      transform: trim,
      message: t('validation.minLength', { min: field.min_length }),
    });
  }
  if (field.max_length) {
    rules.push({
      max: field.max_length,
      transform: trim,
      message: t('validation.maxLength', { max: field.max_length }),
    });
  }
  if (field.pattern) {
    const key =
      field.type === 'email' || field.type === 'tel'
        ? PATTERN_MESSAGES[field.type]
        : 'validation.pattern';
    rules.push({
      pattern: new RegExp(field.pattern),
      transform: trim,
      message: t(key),
    });
  }
  return rules;
}
