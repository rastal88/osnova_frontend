/** The header the backend reads the captcha token from (app/core/captcha.py). */
export const CAPTCHA_HEADER = 'X-Captcha-Token';

export function captchaHeaders(token: string | null | undefined): Record<string, string> {
  return token ? { [CAPTCHA_HEADER]: token } : {};
}
