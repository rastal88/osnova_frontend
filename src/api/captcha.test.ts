import { describe, expect, it } from 'vitest';

import { captchaHeaders } from './captcha';

describe('captchaHeaders', () => {
  it('sends the token in the header the backend reads', () => {
    expect(captchaHeaders('token-1')).toEqual({ 'X-Captcha-Token': 'token-1' });
  });

  it('adds nothing when the captcha is off', () => {
    expect(captchaHeaders(null)).toEqual({});
    expect(captchaHeaders(undefined)).toEqual({});
    expect(captchaHeaders('')).toEqual({});
  });
});
