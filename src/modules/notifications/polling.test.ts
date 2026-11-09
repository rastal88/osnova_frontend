import { afterEach, describe, expect, it, vi } from 'vitest';

import { startPolling } from './polling';

function stubDocument(state: 'visible' | 'hidden') {
  const listeners: Record<string, () => void> = {};
  const doc = {
    visibilityState: state,
    addEventListener: (name: string, fn: () => void) => {
      listeners[name] = fn;
    },
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('document', doc);
  return { doc, listeners };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startPolling', () => {
  it('ticks now and on every interval while visible', () => {
    vi.useFakeTimers();
    stubDocument('visible');
    const tick = vi.fn();
    const stop = startPolling(tick, 1000);
    expect(tick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(3000);
    expect(tick).toHaveBeenCalledTimes(4);
    stop();
    vi.advanceTimersByTime(3000);
    expect(tick).toHaveBeenCalledTimes(4);
  });

  it('waits while hidden and ticks when the page shows again', () => {
    vi.useFakeTimers();
    const { doc, listeners } = stubDocument('hidden');
    const tick = vi.fn();
    startPolling(tick, 1000);
    vi.advanceTimersByTime(3000);
    expect(tick).not.toHaveBeenCalled();
    doc.visibilityState = 'visible';
    listeners.visibilitychange();
    expect(tick).toHaveBeenCalledTimes(1);
  });
});
