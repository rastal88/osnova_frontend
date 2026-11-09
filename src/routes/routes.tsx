import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import type { BootstrapFeatures } from '../api/bootstrap';
import LayoutComponent from '../components/LayoutComponent/LayoutComponent';
import { redirects } from '../config/navigation';
import { exampleRoutes } from '../examples';
import { languageFromPath } from '../i18n/language';
import { adminRoute } from '../modules/admin';
import { authLayoutRoutes, authPublicRoutes } from '../modules/auth';
import { filesRoutes } from '../modules/files';
import Home from '../pages/Home/Home';
import { legalRoutes } from '../pages/Legal';
import NotFound from '../pages/NotFound/NotFound';
import { useBootstrapStore } from '../store/bootstrapStore';
import RouteError from './RouteError';

// Routes are built from the capabilities returned by /bootstrap:
// a disabled module adds no routes, and its lazy pages are never loaded.
// The language prefix (/en, /ru) is the router basename, so routes and links
// stay language-free; switching the language builds a router with a new basename.
const createAppRouter = (features: BootstrapFeatures, language: string) => {
  const routes: RouteObject[] = [];
  const layoutChildren: RouteObject[] = [
    { index: true, element: <Home /> },
    ...exampleRoutes,
    ...legalRoutes,
  ];

  if (features.authentication) {
    routes.push(...authPublicRoutes);
    layoutChildren.push(...authLayoutRoutes);
    if (features.files) layoutChildren.push(...filesRoutes);
  }

  routes.push({
    path: '/',
    element: <LayoutComponent />,
    errorElement: <RouteError />,
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

  return createBrowserRouter(routes, { basename: `/${language}` });
};

const AppRouter = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const features = useBootstrapStore((state) => state.config?.features);
  const languages = useBootstrapStore((state) => state.config?.i18n.languages);
  const router = useMemo(
    () => (features ? createAppRouter(features, language) : null),
    [features, language],
  );

  // Back/forward across a language switch changes the prefix: follow it.
  useEffect(() => {
    const codes = languages?.map((item) => item.code) ?? [];
    const onPopState = () => {
      const fromUrl = languageFromPath(window.location.pathname, codes);
      if (fromUrl && fromUrl !== i18n.language) void i18n.changeLanguage(fromUrl);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [languages, i18n]);

  if (!router) return null;

  return <RouterProvider router={router} />;
};

export default AppRouter;
