/**
 * Files module — "My files" in the client area: upload, list, download, delete.
 * Enabled by the `files` capability from /bootstrap (backend: FILES_ENABLED).
 * The page is lazy-loaded, so it is not in the main bundle.
 */
import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import { ProtectedRoute } from '../auth';

export const filesRoutes: RouteObject[] = [
  {
    path: 'files',
    element: (
      <ProtectedRoute area="client">
        {lazyElement(() => import('./pages/MyFiles/MyFiles'))}
      </ProtectedRoute>
    ),
  },
];
