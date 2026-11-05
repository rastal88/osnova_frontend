import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import LayoutComponent from '../components/LayoutComponent/LayoutComponent';
import AdminLayout from '../components/AdminLayout/AdminLayout';

import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import AdminDashboard from '../pages/Admin/Dashboard/Dashboard.tsx';

import Login from '../pages/Login/Login';
import ProtectedRoute from '../components/ProtectedRoute.tsx';
import Home from '../pages/Home/Home.tsx';
import Register from '../pages/Register/Register.tsx';
import NotFound from '../pages/NotFound/NotFound';

import { useBootstrapStore } from '../store/bootstrapStore';
import type { BootstrapFeatures } from '../api/bootstrap';
import { redirects } from '../config/navigation';

const createAppRouter = (features: BootstrapFeatures) => {
  const authEnabled = features.authentication;
  const adminEnabled = features.admin;

  const protect = (element: ReactNode, roles?: string[]) =>
    authEnabled ? (
      <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
    ) : (
      <>{element}</>
    );

  const routes: RouteObject[] = [];

  if (authEnabled) {
    routes.push({ path: '/login', element: <Login /> });
    routes.push({ path: '/register', element: <Register /> });
  }

  routes.push({
    path: '/',
    element: <LayoutComponent />,
    children: [
      { index: true, element: protect(<Home />) },
      { path: 'dashboard', element: protect(<Dashboard />) },
      { path: 'profile', element: protect(<Profile />) },
      { path: '*', element: <NotFound /> },
    ],
  });

  for (const redirect of redirects) {
    routes.push({
      path: redirect.from,
      element: <Navigate to={redirect.to} replace />,
    });
  }

  if (adminEnabled) {
    routes.push({
      path: '/admin',
      element: protect(<AdminLayout />, ['root', 'moderator']),
      children: [
        { index: true, element: <Navigate to="/admin/dashboard" replace /> },
        {
          path: 'dashboard',
          element: protect(<AdminDashboard />, ['root', 'moderator']),
        },
        { path: 'profile', element: protect(<Profile />) },
      ],
    });
  }

  return createBrowserRouter(routes);
};

const AppRouter = () => {
  const features = useBootstrapStore((state) => state.config?.features);
  const router = useMemo(
    () => (features ? createAppRouter(features) : null),
    [features],
  );

  if (!router) return null;

  return <RouterProvider router={router} />;
};

export default AppRouter;
