import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { buildHead } from '../../seo/head';
import type { HeadTag } from '../../seo/head';
import { useBootstrapStore } from '../../store/bootstrapStore';

/** Page keys of the `seo` namespace (src/locales/<language>/seo.json). */
export type SeoPage =
  | 'home'
  | 'contact'
  | 'examples'
  | 'exampleData'
  | 'exampleLanding'
  | 'privacy'
  | 'terms'
  | 'cookies';

interface SeoProps {
  /** Title and description from the `seo` namespace */
  page?: SeoPage;
  title?: string;
  description?: string;
  /** Absolute URL or a path on the site, defaults to VITE_OG_IMAGE */
  image?: string;
  /** Private pages: sign-in, account, admin, errors */
  noindex?: boolean;
}

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const DEFAULT_IMAGE = import.meta.env.VITE_OG_IMAGE || undefined;

function applyTags(title: string, tags: HeadTag[]) {
  document.title = title;
  for (const el of document.head.querySelectorAll('[data-seo]')) el.remove();
  for (const { tag, attrs } of tags) {
    const el = document.createElement(tag);
    el.setAttribute('data-seo', '');
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    document.head.appendChild(el);
  }
}

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter tags.
 * The same tags are written into static HTML at build time (scripts/prerender.mjs)
 * for link previews; this component keeps them current while navigating.
 */
export const Seo = ({ page, title, description, image, noindex }: SeoProps) => {
  const { t, i18n } = useTranslation('seo');
  const { pathname } = useLocation();
  const config = useBootstrapStore((state) => state.config);
  const siteName = config?.application.name ?? 'Osnova';
  const languages = config?.i18n.languages.map((language) => language.code) ?? [];
  const defaultLanguage = config?.i18n.default ?? i18n.language;

  const head = buildHead({
    title: title ?? (page ? t(`${page}.title`) : siteName),
    description: description ?? (page ? t(`${page}.description`) : t('site.description')),
    siteName,
    siteUrl: SITE_URL,
    path: pathname,
    language: i18n.language,
    languages,
    defaultLanguage,
    image: image ?? DEFAULT_IMAGE,
    noindex,
  });
  const key = JSON.stringify(head);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the serialized head
  useEffect(() => {
    applyTags(head.title, head.tags);
  }, [key]);

  return null;
};

export default Seo;
