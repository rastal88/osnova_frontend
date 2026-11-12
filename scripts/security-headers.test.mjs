import { describe, expect, it } from 'vitest';

import { contentSecurityPolicy, originOf, securityHeaders } from './security-headers.mjs';

const directive = (csp, name) =>
  csp
    .split('; ')
    .find((item) => item.startsWith(`${name} `))
    ?.slice(name.length + 1);

describe('originOf', () => {
  it('keeps only the origin of an absolute URL', () => {
    expect(originOf('https://plausible.io/js/script.js')).toBe('https://plausible.io');
    expect(originOf('')).toBeNull();
    expect(originOf('/local.js')).toBeNull();
  });
});

describe('contentSecurityPolicy', () => {
  it('allows only the site and the captcha by default', () => {
    const csp = contentSecurityPolicy();
    expect(directive(csp, 'default-src')).toBe("'self'");
    expect(directive(csp, 'script-src')).toBe("'self' https://challenges.cloudflare.com");
    expect(directive(csp, 'connect-src')).toBe("'self'");
    expect(directive(csp, 'frame-ancestors')).toBe("'none'");
    expect(directive(csp, 'object-src')).toBe("'none'");
    // No inline scripts anywhere
    expect(directive(csp, 'script-src')).not.toContain('unsafe');
  });

  it('adds the analytics origin and the extra ones once', () => {
    const csp = contentSecurityPolicy({
      analyticsScript: 'https://www.googletagmanager.com/gtag/js?id=G-1',
      extraOrigins: ' https://www.google-analytics.com  https://www.googletagmanager.com nope',
    });
    expect(directive(csp, 'script-src')).toBe(
      "'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
    );
    expect(directive(csp, 'connect-src')).toBe(
      "'self' https://www.googletagmanager.com https://www.google-analytics.com",
    );
  });
});

describe('contentSecurityPolicy with Sentry', () => {
  it('lets the browser send errors to the host of the DSN, without its key', () => {
    const csp = contentSecurityPolicy({ sentryDsn: 'https://public@o1.ingest.sentry.io/42' });
    expect(directive(csp, 'connect-src')).toBe("'self' https://o1.ingest.sentry.io");
    // The SDK comes from the site itself
    expect(directive(csp, 'script-src')).toBe("'self' https://challenges.cloudflare.com");
    expect(csp).not.toContain('public');
  });
});

describe('securityHeaders', () => {
  it('writes nginx add_header lines sent with every answer', () => {
    const snippet = securityHeaders();
    const lines = snippet.split('\n').filter((line) => line.startsWith('add_header'));
    expect(lines).toHaveLength(7);
    expect(lines.every((line) => line.endsWith(' always;'))).toBe(true);
    expect(snippet).toContain('add_header X-Frame-Options "DENY" always;');
    expect(snippet).toContain('add_header Strict-Transport-Security $hsts always;');
    // A value never breaks out of its quotes
    for (const line of lines) expect([0, 2]).toContain(line.split('"').length - 1);
  });
});
