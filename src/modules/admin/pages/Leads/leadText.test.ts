import { describe, expect, it } from 'vitest';

import type { FormDescription } from '../../../../api/generated';
import { formatValue, leadSummary } from './leadText';

const field = (name: string, type: string, options: [string, string][] = []) => ({
  name,
  type: type as FormDescription['fields'][number]['type'],
  label: name,
  required: false,
  min_length: null,
  max_length: null,
  pattern: null,
  options: options.map(([value, label]) => ({ value, label })),
});

const form: FormDescription = {
  name: 'contact',
  title: 'Contact',
  submit: 'Send',
  honeypot: 'website',
  fields: [
    field('name', 'text'),
    field('email', 'email'),
    field('topic', 'select', [['order', 'Order']]),
    field('message', 'textarea'),
    field('phone', 'tel'),
  ],
};
const yesNo = { yes: 'Yes', no: 'No' };

describe('formatValue', () => {
  it('shows option labels, yes / no and a dash for empty values', () => {
    expect(formatValue(form.fields[2], 'order', yesNo)).toBe('Order');
    expect(formatValue(form.fields[2], ['order', 'x'], yesNo)).toBe('Order, x');
    expect(formatValue(undefined, true, yesNo)).toBe('Yes');
    expect(formatValue(undefined, null, yesNo)).toBe('—');
    expect(formatValue(undefined, '', yesNo)).toBe('—');
  });
});

describe('leadSummary', () => {
  it('joins the first short text answers', () => {
    const data = { name: 'Ann', email: 'ann@example.com', message: 'Long text', phone: '+1 555' };
    expect(leadSummary(form, data)).toBe('Ann · ann@example.com · +1 555');
    expect(leadSummary(form, { name: 'Ann', email: '' })).toBe('Ann');
  });

  it('falls back to every string value when the form is unknown', () => {
    expect(leadSummary(undefined, { a: 'x', b: 2, c: 'y' })).toBe('x · y');
  });
});
