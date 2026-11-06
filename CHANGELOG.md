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

### Changed
- Profile page shows the signed-in user instead of sample data.

### Fixed
- Production build (removed references to a missing i18n module, fixed `tsconfig`).
