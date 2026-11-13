/**
 * Admin module — the /admin area for users with the `admin.access` permission.
 * Enabled by the `admin` capability from /bootstrap. Requires the auth module.
 *
 * The admin area uses the same shell as the rest of the app with its own menu
 * (./navigation.ts); access comes from the user's `areas`, sections ask for
 * their own permissions.
 */
import { Navigate, useSearchParams } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import LayoutComponent from '../../components/LayoutComponent/LayoutComponent';
import NotFound from '../../pages/NotFound/NotFound';
import RouteError from '../../routes/RouteError';
import { lazyElement } from '../../routes/lazy';
import { ProtectedRoute } from '../auth';
import { adminNavItems } from './navigation';

/** /admin/settings opens a group: the one of an old `?group=` link, or the site. */
const SettingsStart = () => {
  const [params] = useSearchParams();
  return <Navigate to={`/admin/settings/${params.get('group') ?? 'site'}`} replace />;
};

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
    {
      path: 'audit',
      element: (
        <ProtectedRoute permission="audit.read">
          {lazyElement(() => import('./pages/Audit/Audit'))}
        </ProtectedRoute>
      ),
    },
    { path: 'roles', element: lazyElement(() => import('./pages/Roles/Roles')) },
    { path: 'groups', element: lazyElement(() => import('./pages/Groups/Groups')) },
    // One page per settings group (/admin/settings/site, ...); the old ?group= links too
    { path: 'settings', element: <SettingsStart /> },
    { path: 'settings/:group', element: lazyElement(() => import('./pages/Settings/Settings')) },
    {
      path: 'settings/channels',
      element: lazyElement(() => import('./pages/Channels/Channels')),
    },
    { path: '*', element: <NotFound /> },
  ],
};
