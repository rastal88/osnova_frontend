/**
 * Examples of the template: pages that show its building blocks in use.
 * To remove them from a project: delete this folder, its line in src/routes/routes.tsx,
 * the Examples / Contact items in src/config/navigation.ts and their entries in
 * src/config/prerender.json.
 */
import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../routes/lazy';

/** Pages rendered inside the main layout, public. */
export const exampleRoutes: RouteObject[] = [
  { path: 'examples', element: lazyElement(() => import('./ExamplesIndex')) },
  { path: 'examples/data', element: lazyElement(() => import('./data/ExampleData')) },
  { path: 'examples/landing', element: lazyElement(() => import('./landing/ExampleLanding')) },
  { path: 'contact', element: lazyElement(() => import('./contact/Contact')) },
];
