import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { getApiError, getErrorMessage } from './errors';

const responseError = (status: number, data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
  } as AxiosResponse);

describe('API errors', () => {
  it('reads the backend error body', () => {
    const body = {
      code: 'validation_error',
      message: 'Check the fields',
      fields: [{ field: 'email', message: 'Invalid email' }],
    };
    expect(getApiError(responseError(422, body))).toEqual(body);
    expect(getErrorMessage(responseError(422, body))).toBe('Check the fields');
  });

  it('ignores bodies in another format and non-axios errors', () => {
    expect(getApiError(responseError(502, '<html>Bad gateway</html>'))).toBeNull();
    expect(getApiError(new Error('boom'))).toBeNull();
  });

  it('explains a proxy refusing a large body', () => {
    const tooLarge = getErrorMessage(responseError(413, '<html>413</html>'));
    expect(tooLarge).not.toBe(getErrorMessage(new Error('boom')));
    // The backend's own 413 keeps its message
    const body = { code: 'file_too_large', message: 'Up to 10 MB' };
    expect(getErrorMessage(responseError(413, body))).toBe('Up to 10 MB');
  });

  it('falls back to a local message', () => {
    const network = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(getErrorMessage(network)).not.toBe(getErrorMessage(new Error('boom')));
    expect(getErrorMessage(new Error('boom'))).toBeTruthy();
  });
});
