import type { ErrorEvent } from '@sentry/browser';
import { describe, expect, it } from 'vitest';

import { scrubBreadcrumb, scrubEvent, stripUrl } from './scrub';

describe('stripUrl', () => {
  it('drops the query and the hash', () => {
    expect(stripUrl('https://example.com/reset-password?token=abc#x')).toBe(
      'https://example.com/reset-password',
    );
    expect(stripUrl('/api/v1/admin/users?q=ann@example.com')).toBe('/api/v1/admin/users');
    expect(stripUrl('/en/about')).toBe('/en/about');
  });
});

describe('scrubEvent', () => {
  it('keeps only the page address without the query and drops the user', () => {
    const event = {
      type: undefined,
      request: {
        url: 'https://example.com/en/reset-password?token=secret-token',
        headers: { Referer: 'https://example.com/?email=ann@example.com', 'User-Agent': 'x' },
        cookies: { session: 'cookie-value' },
        query_string: 'token=secret-token',
      },
      user: { email: 'ann@example.com', ip_address: '203.0.113.7' },
    } as ErrorEvent;
    const scrubbed = scrubEvent(event);
    expect(scrubbed.request).toEqual({ url: 'https://example.com/en/reset-password' });
    expect(scrubbed.user).toBeUndefined();
    const text = JSON.stringify(scrubbed);
    for (const secret of ['secret-token', 'ann@example.com', 'cookie-value', '203.0.113.7']) {
      expect(text).not.toContain(secret);
    }
  });
});

describe('scrubBreadcrumb', () => {
  it('drops console lines', () => {
    expect(scrubBreadcrumb({ category: 'console', message: 'ann@example.com' })).toBeNull();
  });

  it('strips the query from requests and navigation', () => {
    expect(
      scrubBreadcrumb({
        category: 'fetch',
        data: { url: '/api/v1/admin/users?q=ann', method: 'GET' },
      }),
    ).toEqual({ category: 'fetch', data: { url: '/api/v1/admin/users', method: 'GET' } });
    expect(
      scrubBreadcrumb({ category: 'navigation', data: { from: '/a?x=1', to: '/b#y' } })?.data,
    ).toEqual({ from: '/a', to: '/b' });
  });
});
