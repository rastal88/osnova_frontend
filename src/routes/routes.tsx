import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import type { BootstrapFeatures } from '../api/bootstrap';
import LayoutComponent from '../components/LayoutComponent/LayoutComponent';
import { redirects } from '../config/navigation';
import { adminRoute } from '../modules/admin';
import { authLayoutRoutes, authPublicRoutes } from '../modules/auth';
import Home from '../pages/Home/Home';
import NotFound from '../pages/NotFound/NotFound';
import { useBootstrapStore } from '../store/bootstrapStore';

// Routes are built from the capabilities returned by /bootstrap:
// a disabled module adds no routes, and its lazy pages are never loaded.
const createAppRouter = (features: BootstrapFeatures) => {
  const routes: RouteObject[] = [];
  const layoutChildren: RouteObject[] = [{ index: true, element: <Home /> }];

  if (features.authentication) {
    routes.push(...authPublicRoutes);
    layoutChildren.push(...authLayoutRoutes);
  }

  routes.push({
    path: '/',
    element: <LayoutComponent />,
    children: [...layoutChildren, { path: '*', element: <NotFound /> }],
  });

  for (const redirect of redirects) {
    routes.push({
      path: redirect.from,
      element: <Navigate to={redirect.to} replace />,
    });
  }

  if (features.authentication && features.admin) {
    routes.push(adminRoute);
  }

  return createBrowserRouter(routes);
};

const AppRouter = () => {
  const features = useBootstrapStore((state) => state.config?.features);
  const router = useMemo(() => (features ? createAppRouter(features) : null), [features]);

  if (!router) return null;

  return <RouterProvider router={router} />;
};

export default AppRouter;
