import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

import PageState from '../components/PageState/PageState';

/**
 * Route element whose code is loaded on first visit (a separate bundle chunk).
 * Modules use it so disabled or unvisited parts are never downloaded.
 */
export function lazyElement(load: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(load);

  return (
    <Suspense fallback={<PageState kind="loading" />}>
      <Component />
    </Suspense>
  );
}
