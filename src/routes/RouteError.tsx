import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import PageState from '../components/PageState/PageState';
import { languageFromPath } from '../i18n/language';
import ErrorPage from '../pages/Error/Error';
import NotFound from '../pages/NotFound/NotFound';
import { useBootstrapStore } from '../store/bootstrapStore';

/**
 * Router-level errors. Right after back/forward across a language switch the
 * URL prefix no longer matches the router basename; show loading until the
 * router for the new language takes over.
 */
const RouteError = () => {
  const error = useRouteError();
  const { i18n } = useTranslation();
  const languages = useBootstrapStore((state) => state.config?.i18n.languages) ?? [];
  const codes = languages.map((language) => language.code);
  const urlLanguage = languageFromPath(window.location.pathname, codes);

  if (urlLanguage && urlLanguage !== i18n.language) {
    return <PageState kind="loading" />;
  }

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error('Route error', error);
  return <ErrorPage />;
};

export default RouteError;
