# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
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

### Changed
- Open Graph tags use `property` instead of `name`.
- Profile page shows the signed-in user instead of sample data.

### Fixed
- Production build (removed references to a missing i18n module, fixed `tsconfig`).
