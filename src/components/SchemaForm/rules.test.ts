import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import type { FormFieldDescription } from '../../api/forms';
import { rulesFor } from './rules';

// Messages as "key:params" to check which one each rule shows
const t = ((key: string, params?: object) =>
  params ? `${key}:${JSON.stringify(params)}` : key) as unknown as TFunction<'forms'>;

const field = (values: Partial<FormFieldDescription>): FormFieldDescription => ({
  name: 'field',
  type: 'text',
  label: 'Field',
  required: false,
  min_length: null,
  max_length: null,
  pattern: null,
  options: [],
  ...values,
});

describe('rulesFor numbers', () => {
  it('checks the range of a number', () => {
    const rules = rulesFor(
      field({ type: 'number', required: true, min_value: 1, max_value: 65535 }),
      t,
    );
    expect(rules).toEqual([
      { required: true, message: 'validation.required' },
      { type: 'number', min: 1, message: 'validation.min:{"min":1}' },
      { type: 'number', max: 65535, message: 'validation.max:{"max":65535}' },
    ]);
  });

  it('keeps 0 as a bound', () => {
    const rules = rulesFor(field({ type: 'number', min_value: 0 }), t);
    expect(rules).toEqual([{ type: 'number', min: 0, message: 'validation.min:{"min":0}' }]);
  });

  it('leaves text fields as they were', () => {
    const rules = rulesFor(field({ required: true, max_length: 10 }), t);
    expect(rules.map((rule) => Object.keys(rule).sort())).toEqual([
      ['message', 'required', 'whitespace'],
      ['max', 'message', 'transform'],
    ]);
  });
});
