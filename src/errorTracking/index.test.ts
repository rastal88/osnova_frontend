import { afterEach, describe, expect, it, vi } from 'vitest';

const sent: unknown[] = [];
const startSentry = vi.fn(() => (error: unknown) => {
  sent.push(error);
});
vi.mock('./sentry', () => ({ startSentry }));

/** A fresh copy of the module: the DSN is read when it loads. */
async function load(dsn: string) {
  vi.stubEnv('VITE_SENTRY_DSN', dsn);
  // Tests run without a browser: only the listeners are needed
  vi.stubGlobal('window', new EventTarget());
  vi.resetModules();
  return import('./index');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  sent.length = 0;
  startSentry.mockClear();
});

describe('error tracking', () => {
  it('does nothing without a DSN', async () => {
    const { initErrorTracking, reportError } = await load('');
    initErrorTracking();
    reportError(new Error('lost'));
    await vi.waitFor(() => expect(startSentry).not.toHaveBeenCalled());
    expect(sent).toEqual([]);
  });

  it('keeps errors until the SDK is loaded, then sends them and the next ones', async () => {
    const { initErrorTracking, reportError } = await load('https://public@sentry.example/1');
    const early = new Error('early');
    reportError(early);
    initErrorTracking();
    await vi.waitFor(() => expect(sent).toEqual([early]));
    expect(startSentry).toHaveBeenCalledWith('https://public@sentry.example/1');

    const later = new Error('later');
    reportError(later);
    expect(sent).toEqual([early, later]);
  });
});
