// The Sentry SDK, in its own chunk (imported only by index.ts when VITE_SENTRY_DSN is set)
import { captureException, init } from '@sentry/browser';

import { scrubBreadcrumb, scrubEvent } from './scrub';

export function startSentry(dsn: string) {
  init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    release: `osnova-frontend@${__APP_VERSION__}`,
    // Nothing about the visitor: no user, cookies, headers, bodies or query parameters
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
  return (error: unknown) => {
    captureException(error);
  };
}
