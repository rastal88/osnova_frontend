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
export { AREA_HOME, type Area, areaOfPath, landingPath, otherArea } from './areas';

export const profileElement = lazyElement(() => import('./pages/Profile/Profile'));

/** Standalone pages outside the main layout. */
export const authPublicRoutes: RouteObject[] = [
  { path: '/login', element: lazyElement(() => import('./pages/Login/Login')) },
  {
    path: '/register',
    element: lazyElement(() => import('./pages/Register/Register')),
  },
  // Links from emails (the backend sends them to FRONTEND_URL/<language>/...)
  {
    path: '/verify-email',
    element: lazyElement(() => import('./pages/VerifyEmail/VerifyEmail')),
  },
  {
    path: '/forgot-password',
    element: lazyElement(() => import('./pages/ForgotPassword/ForgotPassword')),
  },
  {
    path: '/reset-password',
    element: lazyElement(() => import('./pages/ResetPassword/ResetPassword')),
  },
  // Sign-in with an external provider returns here (backend: app/modules/auth/oauth.py)
  {
    path: '/oauth/:provider/callback',
    element: lazyElement(() => import('./pages/OAuthCallback/OAuthCallback')),
  },
];

/** Client area: pages inside the main layout for any signed-in user. */
export const authLayoutRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute area="client">
        {lazyElement(() => import('./pages/Dashboard/Dashboard'))}
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: <ProtectedRoute area="client">{profileElement}</ProtectedRoute>,
  },
];
