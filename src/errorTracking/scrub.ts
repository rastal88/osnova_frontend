import type { Breadcrumb, ErrorEvent } from '@sentry/browser';

/**
 * Addresses lose their query and hash: they may hold a password reset token, a search
 * by email in the admin, filters with names.
 */
export function stripUrl(url: string): string {
  return url.split(/[?#]/, 1)[0];
}

/** The event without the visitor: page address without query, no user, no headers. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    const { url } = event.request;
    event.request = url ? { url: stripUrl(url) } : {};
  }
  event.user = undefined;
  return event;
}

/** Console lines are not kept (they may print data); request and page addresses lose the query. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null;
  const data = breadcrumb.data;
  if (data) {
    for (const key of ['url', 'from', 'to']) {
      if (typeof data[key] === 'string') data[key] = stripUrl(data[key]);
    }
  }
  return breadcrumb;
}
