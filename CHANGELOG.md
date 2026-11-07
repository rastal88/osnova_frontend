# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Unit tests with Vitest (`npm test`, runs in CI): formatting, table query, navigation,
  language URLs and API errors.
- Cookie consent: with `VITE_ANALYTICS_SCRIPT` set, a banner asks for consent and the
  analytics script loads only after "Accept" (`src/config/analytics.ts`, `src/consent`);
  the choice is kept in `app_consent` and can be changed on the cookie policy page.
  Without analytics there is no banner.
- Legal pages `/privacy`, `/terms`, `/cookies` with placeholder texts in `legal.json`
  (en, ru); owner details in `src/config/legal.ts`, a "template" notice until they are
  filled. Links in the footer; the pages are prerendered for SEO.
- API types generated from the backend `openapi.json` into `src/api/generated` (committed);
  CI fails when they are out of date. Bootstrap, form and error types come from there.
- Routing and navigation built from backend capabilities (`/bootstrap`).
- App shell with configurable menu position, mobile drawer, light/dark theme.
- `PageContainer` with shared page states, 404 and error pages, error boundary, `Seo`.
- Auth and admin as lazy-loaded modules in `src/modules/` (separate bundle chunks).
- Docker image (Node build → nginx) proxying the API on the same origin.
- Open-source repository files.
- Translations with react-i18next: `src/locales/{en,ru}`, lazy-loaded per namespace,
  keys type-checked against English. Language from `/bootstrap`, Ant Design locale,
  `Accept-Language` on API requests, `getErrorMessage` for translated server errors.
- Language URLs (`/en/...`, `/ru/...`) with redirect from unprefixed URLs (saved choice,
  browser language, backend default) and a language switcher that remembers the choice.
- Router-level 404 and error pages instead of the React Router default.
- SEO: `Seo` sets canonical, `hreflang`, Open Graph and Twitter tags; texts in `seo.json`.
- Build-time prerender of `<head>` per page and language for link previews, plus
  `sitemap.xml` and `robots.txt` (`VITE_SITE_URL`).

- `SchemaForm`: a form rendered from its backend description (`GET /forms/<name>`) with
  client rules, per-field server errors, sending / success / error-with-retry states and
  a consent checkbox linking to the privacy policy. Example `/contact` page in the menu,
  prerendered for link previews.
- `DataTable`: search, column filters, sorting and pagination kept in the URL, for local
  data or a server `fetch(query) → { items, total }` with loading and retry.
- `useFormat()`: dates, relative time, numbers, percent and money in the interface language
  (built on `Intl`).
- Landing blocks in `src/components/blocks`: Hero, Services, Gallery, Pricing, Reviews, FAQ,
  CTA; example page `/examples/landing`.
- `Image`: `<picture>` with AVIF / WebP, lazy loading and fixed size; `npm run images` (sharp,
  dev dependency) generates responsive variants from `src/assets/images/source`.
- Examples in `src/examples` (`/examples`, `/examples/data`, `/contact`), easy to delete.
- Brand in one place: `src/config/brand.ts` (light/dark palettes, radius, font) builds the
  Ant Design themes and CSS variables for custom styles.

### Changed
- Node.js 24 LTS (`.nvmrc`, `engines`) for development, CI and the Docker image; Node 20 is
  end-of-life. Dev tools updated: `@hey-api/openapi-ts` 0.99 (`postProcess` replaces
  `format` / `lint` in its config), Vitest 5, sharp 0.35.
- Navigation: the menu is on the left by default and collapses to icons (the choice is
  remembered); the header keeps the brand on the left and language, theme and profile on the
  right. `top` and `right` positions still work.
- The contact form example moved to `/examples/contact` and is no longer a menu item; it is
  reached from the Examples page.
- README and DEVELOPMENT.md rewritten in English and brought up to date (features, layout,
  scripts, legal pages and cookie banner, tooling).
- One tool for lint and format: Biome (`npm run lint`, `npm run format`), configured to the
  existing code style; `npm run typecheck` added. CI runs lint and type check.
- Sign-in and sign-up use Ant Design forms in a shared card, follow the theme and show
  per-field server errors.
- Roboto is a Latin + Cyrillic WOFF2 subset with `font-display: swap` (504 KB → 69 KB).
- Removed global CSS that restyled every button, link and many Ant Design components.
- Env files are no longer committed: `.env.example` documents every variable,
  local values go to `.env.local`. Removed unused `VITE_TOKEN`, `VITE_SOCKET_URL`,
  `VITE_API_URL`, `VITE_DEBUG_MODE` and the `build:dev` / `build:prod` scripts.
- Open Graph tags use `property` instead of `name`.

### Fixed
- Ant Design 5 compatibility warning with React 19 (`@ant-design/v5-patch-for-react-19`).
- Docker image accepts `VITE_ANALYTICS_SCRIPT` as a build argument; before, analytics and the
  cookie banner could not be turned on in Docker builds.
- Header on phones: a long site name is cut with an ellipsis instead of covering the
  buttons; tighter spacing and an icon-only sign-in button below 768px.
- With authentication enabled, guests can open public pages (home, contact, sign-up) by URL:
  the layout no longer redirects them, and the current-user check does not send a 401 to
  `/login`. Guests get a sign-in button; menu items can require sign-in or roles.
- Dark theme uses Ant Design's dark algorithm, so secondary text (optional marks,
  counters, placeholders) is readable; Select follows the theme instead of a global
  white background.
- Profile page shows the signed-in user instead of sample data.
- Production build (removed references to a missing i18n module, fixed `tsconfig`).

### Removed
- Playwright and its empty example test (unit tests come first; end-to-end tests can be
  added later).
- ESLint and its plugins (replaced by Biome).
- Unused `@hey-api/client-axios` runtime dependency and the empty `openapi.json`.

### Security
- Dependencies with known vulnerabilities updated (`npm audit`: 23 before, none after);
  `js-yaml` inside the API type generator is overridden to a fixed release.
