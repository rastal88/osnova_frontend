/**
 * Admin module — the /admin area for users with the `admin.access` permission.
 * Enabled by the `admin` capability from /bootstrap. Requires the auth module.
 *
 * The admin area uses the same shell as the rest of the app with its own menu
 * (./navigation.ts); access comes from the user's `areas`, sections ask for
 * their own permissions.
 */
import type { RouteObject } from 'react-router-dom';

import LayoutComponent from '../../components/LayoutComponent/LayoutComponent';
import NotFound from '../../pages/NotFound/NotFound';
import RouteError from '../../routes/RouteError';
import { lazyElement } from '../../routes/lazy';
import { ProtectedRoute } from '../auth';
import { adminNavItems } from './navigation';

export const adminRoute: RouteObject = {
  path: '/admin',
  element: (
    <ProtectedRoute area="admin">
      <LayoutComponent navItems={adminNavItems} />
    </ProtectedRoute>
  ),
  errorElement: <RouteError />,
  children: [
    { index: true, element: lazyElement(() => import('./pages/Dashboard/Dashboard')) },
    {
      path: 'leads',
      element: (
        <ProtectedRoute permission="leads.read">
          {lazyElement(() => import('./pages/Leads/Leads'))}
        </ProtectedRoute>
      ),
    },
    {
      path: 'users',
      element: (
        <ProtectedRoute permission="users.read">
          {lazyElement(() => import('./pages/Users/Users'))}
        </ProtectedRoute>
      ),
    },
    { path: 'roles', element: lazyElement(() => import('./pages/Roles/Roles')) },
    { path: 'groups', element: lazyElement(() => import('./pages/Groups/Groups')) },
    { path: 'settings', element: lazyElement(() => import('./pages/Settings/Settings')) },
    {
      path: 'settings/channels',
      element: lazyElement(() => import('./pages/Channels/Channels')),
    },
    { path: '*', element: <NotFound /> },
  ],
};
