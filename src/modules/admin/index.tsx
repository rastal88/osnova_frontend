/**
 * Admin module — the /admin section for ROOT and MODERATOR roles.
 * Enabled by the `admin` capability from /bootstrap. Requires the auth module.
 */
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import { ProtectedRoute, profileElement } from '../auth';

export const ADMIN_ROLES = ['root', 'moderator'];

export const adminRoute: RouteObject = {
  path: '/admin',
  element: (
    <ProtectedRoute roles={ADMIN_ROLES}>
      {lazyElement(() => import('./AdminLayout/AdminLayout'))}
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
    { path: 'dashboard', element: lazyElement(() => import('./pages/Dashboard/Dashboard')) },
    { path: 'profile', element: profileElement },
  ],
};
