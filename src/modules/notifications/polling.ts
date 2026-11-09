/** How often the bell asks for the unread count while the page is visible. */
export const POLL_MS = 60_000;

/**
 * Calls `tick` now, every `interval` while the page is visible, and again when it
 * becomes visible. Returns a function that stops it.
 */
export function startPolling(tick: () => void, interval = POLL_MS): () => void {
  let timer: ReturnType<typeof setInterval> | undefined;
  const run = () => {
    if (document.visibilityState === 'visible') tick();
  };
  const onVisibility = () => run();

  run();
  timer = setInterval(run, interval);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    clearInterval(timer);
    timer = undefined;
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
