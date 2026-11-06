// Runs after `vite build`. For every public page (src/config/prerender.json) and
// every language it writes dist/<language>/<path>/index.html with the page's title,
// description, canonical, hreflang and Open Graph tags, so link previews and
// crawlers get them without running JavaScript. Also writes sitemap.xml and robots.txt.
//
// Languages come from the backend /bootstrap when it is reachable at build time,
// otherwise from VITE_LANGUAGES / VITE_DEFAULT_LANGUAGE (default: every folder in
// src/locales, English first).
//
// Usage: node scripts/prerender.mjs [--mode <vite mode>]

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

import { buildHead, escapeHtml, pageUrl, renderTags } from '../src/seo/head.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const modeIndex = process.argv.indexOf('--mode');
const mode = modeIndex > 0 ? process.argv[modeIndex + 1] : 'production';
const env = { ...loadEnv(mode, root, ''), ...process.env };

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const exists = (path) =>
  readFile(path).then(
    () => true,
    () => false,
  );

async function fetchBootstrap() {
  const api = env.PRERENDER_API_URL || env.VITE_BASE_URL;
  if (!api?.startsWith('http')) return null;
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/bootstrap`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function resolveSite() {
  const bootstrap = await fetchBootstrap();
  if (bootstrap?.i18n) {
    console.log('prerender: languages from /bootstrap');
    return {
      siteName: bootstrap.application.name,
      languages: bootstrap.i18n.languages.map((language) => language.code),
      defaultLanguage: bootstrap.i18n.default,
    };
  }

  const folders = (await readdir(join(root, 'src/locales'))).sort((a, b) =>
    a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b),
  );
  const languages = env.VITE_LANGUAGES
    ? env.VITE_LANGUAGES.split(',').map((code) => code.trim().toLowerCase()).filter(Boolean)
    : folders;
  const defaultLanguage = languages.includes(env.VITE_DEFAULT_LANGUAGE)
    ? env.VITE_DEFAULT_LANGUAGE
    : languages[0];
  console.log('prerender: backend not reachable, languages from env / src/locales');
  return { siteName: env.VITE_APP_NAME || 'Osnova', languages, defaultLanguage };
}

async function seoTexts(language) {
  const path = join(root, 'src/locales', language, 'seo.json');
  const english = await readJson(join(root, 'src/locales/en/seo.json'));
  return (await exists(path)) ? { ...english, ...(await readJson(path)) } : english;
}

function renderPage(template, language, head) {
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${language}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(head.title)}</title>`)
    .replace('</head>', `  ${renderTags(head.tags)}\n  </head>`);
}

function sitemap(siteUrl, pages, languages, defaultLanguage) {
  const urls = pages.flatMap((page) =>
    languages.map((language) => {
      const alternates = languages
        .map(
          (other) =>
            `    <xhtml:link rel="alternate" hreflang="${other}" href="${pageUrl(siteUrl, other, page.path)}"/>`,
        )
        .concat(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(siteUrl, defaultLanguage, page.path)}"/>`,
        )
        .join('\n');
      return `  <url>\n    <loc>${pageUrl(siteUrl, language, page.path)}</loc>\n${alternates}\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

const template = await readFile(join(dist, 'index.html'), 'utf8');
const { pages } = await readJson(join(root, 'src/config/prerender.json'));
const { siteName, languages, defaultLanguage } = await resolveSite();
const siteUrl = env.VITE_SITE_URL?.replace(/\/$/, '');

if (!siteUrl) {
  console.warn('prerender: VITE_SITE_URL is not set — no canonical/hreflang/og:url, no sitemap');
}

for (const language of languages) {
  const texts = await seoTexts(language);
  for (const page of pages) {
    const head = buildHead({
      title: texts[page.seo]?.title ?? siteName,
      description: texts[page.seo]?.description ?? texts.site?.description,
      siteName,
      siteUrl,
      path: page.path,
      language,
      languages,
      defaultLanguage,
      image: env.VITE_OG_IMAGE || undefined,
    });
    const dir = join(dist, language, page.path === '/' ? '' : page.path);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), renderPage(template, language, head));
  }
}

const robots = ['User-agent: *', 'Allow: /'];
if (siteUrl) {
  await writeFile(join(dist, 'sitemap.xml'), sitemap(siteUrl, pages, languages, defaultLanguage));
  robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
}
await writeFile(join(dist, 'robots.txt'), `${robots.join('\n')}\n`);

console.log(
  `prerender: ${pages.length} page(s) × ${languages.length} language(s) [${languages.join(', ')}]`,
);
