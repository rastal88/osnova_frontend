/**
 * Auth module — login, registration and pages for signed-in users.
 * Enabled by the `authentication` capability from /bootstrap.
 *
 * Public API for the rest of the app: route lists, ProtectedRoute and the store.
 * Pages are lazy-loaded, so they are not in the main bundle.
 */
import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import ProtectedRoute from './components/ProtectedRoute';

export { default as ProtectedRoute } from './components/ProtectedRoute';
export { useAuthStore } from './authStore';

/** Standalone pages outside the main layout. */
export const authPublicRoutes: RouteObject[] = [
  { path: '/login', element: lazyElement(() => import('./pages/Login/Login')) },
  {
    path: '/register',
    element: lazyElement(() => import('./pages/Register/Register')),
  },
];

/** Pages rendered inside the main layout, for any signed-in user. */
export const authLayoutRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>{lazyElement(() => import('./pages/Dashboard/Dashboard'))}</ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: (
      <ProtectedRoute>{lazyElement(() => import('./pages/Profile/Profile'))}</ProtectedRoute>
    ),
  },
];

export const profileElement = lazyElement(() => import('./pages/Profile/Profile'));
