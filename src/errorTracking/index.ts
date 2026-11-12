/**
 * Optional error tracking in Sentry (or GlitchTip): on only when VITE_SENTRY_DSN is set
 * at build time. Without it the build has no Sentry code at all; with it the SDK comes
 * in its own chunk, loaded after start, so the first paint does not wait for it.
 * Errors reported before the chunk arrives are kept and sent once it is there.
 *
 * Reported: unhandled errors and promise rejections, and what the error boundary and
 * the router error page catch (`reportError`). What is sent is cleaned in scrub.ts.
 */
const DSN = import.meta.env.VITE_SENTRY_DSN || '';
const QUEUE_LIMIT = 20;

type Report = (error: unknown) => void;

let send: Report | null = null;
const queue: unknown[] = [];

export function reportError(error: unknown) {
  if (!DSN) return;
  if (send) send(error);
  else if (queue.length < QUEUE_LIMIT) queue.push(error);
}

function onEarlyError(event: ErrorEvent | PromiseRejectionEvent) {
  const error = 'reason' in event ? event.reason : event.error;
  if (error) reportError(error);
}

export function initErrorTracking() {
  if (DSN) {
    window.addEventListener('error', onEarlyError);
    window.addEventListener('unhandledrejection', onEarlyError);
    import('./sentry')
      .then(({ startSentry }) => {
        // From here on the SDK catches unhandled errors itself
        window.removeEventListener('error', onEarlyError);
        window.removeEventListener('unhandledrejection', onEarlyError);
        send = startSentry(DSN);
        for (const error of queue.splice(0)) send(error);
      })
      .catch(() => {
        // Blocked (an ad blocker) or offline: the site works without it
      });
  }
}
