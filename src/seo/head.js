// Builds SEO tags for one page in one language. Plain JS on purpose: the same code
// runs in the app (Seo component) and in the build script (scripts/prerender.mjs).

/** Open Graph locales; add a line when adding a language. */
const OG_LOCALES = { en: 'en_US', ru: 'ru_RU' };

const ogLocale = (language) => OG_LOCALES[language] ?? language;

/** '/login' -> 'https://site/en/login', '/' -> 'https://site/en' */
export function pageUrl(siteUrl, language, path) {
  return `${siteUrl.replace(/\/$/, '')}/${language}${path === '/' ? '' : path}`;
}

/**
 * @param {object} input
 * @param {string} input.title         Page title without the site name
 * @param {string} input.siteName
 * @param {string} [input.description]
 * @param {string} [input.siteUrl]     Absolute origin; without it URL-based tags are skipped
 * @param {string} input.path          Page path without the language prefix
 * @param {string} input.language
 * @param {string[]} input.languages   Enabled languages
 * @param {string} input.defaultLanguage
 * @param {string} [input.image]       Absolute URL or a path on the site
 * @param {boolean} [input.noindex]
 * @returns {{ title: string, tags: { tag: 'meta' | 'link', attrs: Record<string, string> }[] }}
 */
export function buildHead(input) {
  const { siteName, description, siteUrl, path, language, languages, defaultLanguage, noindex } =
    input;
  const title = input.title && input.title !== siteName ? `${input.title} – ${siteName}` : siteName;
  const tags = [];
  const meta = (key, name, content) => {
    if (content) tags.push({ tag: 'meta', attrs: { [key]: name, content } });
  };
  const link = (attrs) => tags.push({ tag: 'link', attrs });

  meta('name', 'description', description);
  if (noindex) meta('name', 'robots', 'noindex');

  meta('property', 'og:type', 'website');
  meta('property', 'og:site_name', siteName);
  meta('property', 'og:title', title);
  meta('property', 'og:description', description);
  meta('property', 'og:locale', ogLocale(language));
  for (const other of languages) {
    if (other !== language) meta('property', 'og:locale:alternate', ogLocale(other));
  }

  let image = input.image;
  if (image && siteUrl && image.startsWith('/')) image = `${siteUrl.replace(/\/$/, '')}${image}`;
  meta('property', 'og:image', image);
  meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', description);

  if (siteUrl) {
    const url = pageUrl(siteUrl, language, path);
    meta('property', 'og:url', url);
    link({ rel: 'canonical', href: url });
    for (const other of languages) {
      link({ rel: 'alternate', hreflang: other, href: pageUrl(siteUrl, other, path) });
    }
    link({ rel: 'alternate', hreflang: 'x-default', href: pageUrl(siteUrl, defaultLanguage, path) });
  }

  return { title, tags };
}

export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Tags as HTML for static files. `data-seo` lets the app replace them later. */
export function renderTags(tags) {
  return tags
    .map(({ tag, attrs }) => {
      const list = Object.entries(attrs).map(([key, value]) => `${key}="${escapeHtml(value)}"`);
      return `<${tag} data-seo ${list.join(' ')}>`;
    })
    .join('\n    ');
}
