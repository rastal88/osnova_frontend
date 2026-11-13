# Osnova Frontend

[![CI](https://github.com/rastal88/osnova_frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/rastal88/osnova_frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The web interface (SPA) of [Osnova](https://github.com/rastal88/osnova_backend)**, a
modular full-stack template for web applications.

It works together with the `osnova_backend` API and talks to it only over REST. The
backend README describes the architecture, the `minimal` / `standard` / `scalable`
profiles and capabilities.

## Stack

- React 19 + TypeScript, Vite
- Ant Design (UI), Zustand (state), React Router, Axios
- react-i18next (translations), build-time prerender of `<head>` for SEO and link previews
- Biome (lint and format), Vitest (unit tests)
- `@hey-api/openapi-ts`: API types from the backend `openapi.json` (`src/api/generated`)

## Features

- Routes and UI built from `GET /api/v1/bootstrap`: a disabled capability adds no routes
  and its code is never downloaded
- App shell: header, collapsible side menu (or a top menu), mobile menu, footer, breadcrumbs,
  shared page states (loading, empty, error, forbidden), 404 and error pages
- Languages in the URL (`/en`, `/ru`) with a switcher; per-page SEO, `hreflang`,
  link previews, `sitemap.xml` and `robots.txt`
- Light / dark theme and brand colours in one file (`src/config/brand.ts`)
- Forms rendered from their backend description, with client and server validation
- Tables with search, filters, sorting and pagination kept in the URL; locale-aware
  dates, numbers and money; optimised images (AVIF / WebP)
- Landing blocks: hero, services, gallery, pricing, reviews, FAQ, call to action
- Legal pages (privacy, terms, cookies) as placeholders; a cookie banner when analytics is on
- With `authentication` on the backend: sign-in, sign-up (also with Google when the backend
  has its keys), email confirmation and password reset by email, the user area (starts on home; one profile page for every role, with the account's language for emails and notifications); with `admin`: the admin area (the `admin.access` permission; sections and actions by permission) in the same shell,
  landing by role after sign-in and a switch between the areas in the user menu;
  Admin → Settings generated from the backend, a tab per group (site, languages, mail with a
  test email, protection, data retention, files, notifications), each changed with its own
  permission;
  Admin → Users: search, filters, block / unblock, role and groups; Admin → Access: roles
  (permissions by area), groups and the audit log; Admin → Leads: form
  submissions with search, filters, details, status, delete and delivery results; Admin →
  Channels: email / Telegram / webhook delivery set up and tested in the admin; with `files`:
  "My files" in the user area (drag-and-drop upload, search, download, delete); with
  `notifications`: the bell in the header (unread count, latest items, mark read)

## Layout

```
src/
├── api/          # Axios client, bootstrap, forms, errors, generated API types
├── components/   # shell and building blocks: Layout, PageContainer, PageState, Seo,
│                 # SchemaForm, DataTable, Image, landing blocks, CookieBanner...
├── config/       # navigation, brand, format, legal, analytics, prerender pages
├── consent/      # cookie consent state
├── errorTracking/ # optional Sentry (VITE_SENTRY_DSN), its own chunk
├── examples/     # example pages, safe to delete
├── i18n/         # i18next setup, language in the URL, formatting
├── locales/      # translations: <language>/<namespace>.json
├── modules/      # optional modules, one folder each
│   ├── auth/     # sign-in, sign-up, profile, ProtectedRoute   ← authentication
│   ├── admin/    # /admin section for root / moderator         ← admin
│   ├── files/    # "My files": upload, list, download, delete   ← files
│   ├── notifications/ # the bell in the header                ← notifications
│   └── off.ts    # what the core gets from a module removed with npm run strip
├── pages/        # core pages: Home, legal pages, 404, error
├── routes/       # router built from capabilities, lazyElement()
├── seo/          # SEO tags shared by the app and the prerender script
├── store/        # Zustand stores (bootstrap)
└── utils/
```

**Module = folder.** A module exports its routes from `modules/<name>/index.tsx`; pages
are loaded with `lazyElement()` into separate chunks, so a page that is disabled or never
opened is never downloaded.

**Remove the modules you do not use:** `npm run strip` reads the flags of
`../osnova_backend/.env` (or name them: `npm run strip -- files notifications`) and lists
what goes; `npm run strip -- --apply` removes it (asks first; only on a clean git working
tree, so `git checkout . && git clean -fd` undoes it). A module goes with the modules that
need it (`auth` takes admin, files and notifications). It deletes `src/modules/<name>` and
points the core's imports of it at `src/modules/off.ts`: the same names with the values of
a module that is off, as when its capability is off in `/bootstrap`, so the core and the
header stay as they are. Run `make strip` in the backend too.

The rule that keeps this working: the core imports a module only from its index
(`modules/<name>`), only values, and only names that `src/modules/off.ts` has
(`src/modules/off.test.ts` checks it). Each module's `off.check.ts` makes `npm run
typecheck` fail when its values and their stand-ins in `off.ts` stop fitting; CI strips a
copy for each module and runs the lint, type check, tests and build.

## Quick start

Requirements: Node.js 24 (`.nvmrc`); the backend from
[osnova_backend](https://github.com/rastal88/osnova_backend) running on
`http://localhost:8000`.

```bash
npm install
cp .env.example .env.local   # optional: every value has a default
npm run dev                  # http://localhost:5173
```

Or start both from the backend folder with `make dev-all` (expects this repository at
`../osnova_frontend`).

Env files: only `.env.example` is committed; local values go to `.env.local` (ignored by
git). Every `VITE_*` value ends up in the public JavaScript bundle, so frontend env files
must never contain secrets; they belong on the backend.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check, production build and prerender |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Biome: lint, format and import order check |
| `npm run format` | Biome: fix formatting and safe lint issues |
| `npm run typecheck` | TypeScript check (`tsc -b`) |
| `npm test` | Unit tests (Vitest); `npm run test:watch` reruns on changes |
| `npm run generate:client` | API types from `../osnova_backend/openapi.json` (after `make openapi` on the backend; commit the result) |
| `npm run images` | Image variants from `src/assets/images/source` |

CI runs lint, type check, tests, checks the API types against the backend schema and
builds.

## Backend connection

- API base URL: `VITE_BASE_URL` (default `http://localhost:8000/api/v1`; `/api/v1` in Docker).
- Capabilities, languages and the app version come from `GET /api/v1/bootstrap`.
- Sign-in uses a cookie with a JWT; a `401` sends the user to `/login`.
- Error messages arrive already translated: the request carries `Accept-Language`.

## Docker

A two-stage image (Node build → nginx) serves the SPA and proxies `/api`, `/docs`,
`/redoc` and `/openapi.json` to the `backend` service, so there is one origin and no CORS.

```bash
docker build --build-arg VITE_BASE_URL=/api/v1 --build-arg VITE_SITE_URL=https://example.com -t osnova-frontend .
```

Usually it runs as part of the whole system from `osnova_backend` (`make up-minimal`,
`make up-standard`), which passes the site URL, languages and app name from the backend
`.env`. Build variables: [DEVELOPMENT.md](DEVELOPMENT.md#24-seo-and-link-previews);
analytics: `--build-arg VITE_ANALYTICS_SCRIPT=<script URL>`; error tracking:
`--build-arg VITE_SENTRY_DSN=<DSN>` (DEVELOPMENT.md → Error tracking).

nginx sends security headers with every answer: a Content Security Policy (the site, the
Turnstile captcha and the analytics origin; no inline scripts), `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`, and HSTS when the proxy in front reports HTTPS
(`X-Forwarded-Proto: https`). The host of `VITE_SENTRY_DSN` is allowed to receive data.
The policy is written at build time by
`scripts/security-headers.mjs`; a service that loads or sends data from another host (e.g.
Google Analytics) needs `--build-arg CSP_EXTRA_ORIGINS="https://www.google-analytics.com"`.

## More

- Developer guide (shell, navigation, languages, forms, tables, theme, tests):
  [DEVELOPMENT.md](DEVELOPMENT.md).
- Roadmap: [ROADMAP.md](https://github.com/rastal88/osnova_backend/blob/main/ROADMAP.md);
  changes: [CHANGELOG.md](CHANGELOG.md).
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md); security: [SECURITY.md](SECURITY.md).
- License: [MIT](LICENSE).
