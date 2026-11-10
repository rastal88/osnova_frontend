/**
 * Admin module — the /admin area for the ROOT and MODERATOR roles.
 * Enabled by the `admin` capability from /bootstrap. Requires the auth module.
 *
 * The admin area uses the same shell as the rest of the app with its own menu
 * (./navigation.ts); access comes from the user's `areas`.
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
    { path: 'leads', element: lazyElement(() => import('./pages/Leads/Leads')) },
    { path: 'users', element: lazyElement(() => import('./pages/Users/Users')) },
    { path: 'settings', element: lazyElement(() => import('./pages/Settings/Settings')) },
    {
      path: 'settings/channels',
      element: lazyElement(() => import('./pages/Channels/Channels')),
    },
    { path: '*', element: <NotFound /> },
  ],
};
