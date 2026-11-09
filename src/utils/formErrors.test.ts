import type { FormInstance } from 'antd';
import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { setServerFieldErrors } from './formErrors';

function validationError(fields: { field: string; code: string; message: string }[]) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('422', 'ERR_BAD_REQUEST', config, null, {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config,
    data: { code: 'validation_error', message: 'Check the fields', fields },
  });
}

describe('setServerFieldErrors', () => {
  it('maps nested server fields to form paths', () => {
    const form = { setFields: vi.fn(), scrollToField: vi.fn() } as unknown as FormInstance;
    const error = validationError([
      { field: 'params.chat_id', code: 'missing', message: 'Required' },
      { field: 'other', code: 'missing', message: 'Ignored' },
    ]);

    expect(setServerFieldErrors(form, error, ['name', 'params.chat_id'])).toBe(true);
    expect(form.setFields).toHaveBeenCalledWith([
      { name: ['params', 'chat_id'], errors: ['Required'] },
    ]);
    expect(form.scrollToField).toHaveBeenCalledWith(['params', 'chat_id']);
  });

  it('returns false when no field matches', () => {
    const form = { setFields: vi.fn(), scrollToField: vi.fn() } as unknown as FormInstance;
    expect(setServerFieldErrors(form, new Error('x'), ['name'])).toBe(false);
    expect(form.setFields).not.toHaveBeenCalled();
  });
});
