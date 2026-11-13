# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- `npm run strip` (`scripts/strip.mjs`, Node only) removes the modules a project does not
  use, by the flags of `../osnova_backend/.env` or by name, with the modules that need them
  (`auth` takes admin, files and notifications). It lists what goes; with `-- --apply`
  (asks first, only on a clean git working tree) it deletes `src/modules/<name>`, points
  the core's imports of it at `src/modules/off.ts` (the same names with the values of a
  module that is off, so the core and the header do not change) and removes the CI blocks
  between `strip:begin` and `strip:end`.
- Checks that keep it working: `src/modules/off.test.ts` (the core imports only values
  from a module's index that `off.ts` also has), an `off.check.ts` in each module (type
  check that its values fit their stand-ins), a CI job that strips each module and runs
  the lint, type check, tests and build.

### Changed
- The navigation's `Area` type is the core's own (`src/config/navigation.ts`), not the one
  generated from the auth API, which a stripped backend no longer has.

## [0.5.0] - 2026-11-13

Production: security headers with a Content Security Policy from nginx, and optional error
tracking in its own chunk.

### Added
- Optional error tracking: with `VITE_SENTRY_DSN` (Sentry or GlitchTip) unhandled errors,
  promise rejections and what the error boundary and the router error page catch are sent,
  with the release `osnova-frontend@<version>` and `VITE_SENTRY_ENVIRONMENT`. Without the
  DSN the build has no Sentry code; with it `@sentry/browser` is its own chunk (~32 KB
  gzipped) loaded after start, errors before it are kept. No personal data: no user,
  cookies, headers or bodies, addresses without query and hash, no console lines. The
  Content Security Policy allows the DSN host; the Docker image takes `VITE_SENTRY_DSN` and
  `VITE_SENTRY_ENVIRONMENT` as build arguments. `reportError` for your own `catch` blocks.
- Security headers from nginx: Content Security Policy (the site, Cloudflare Turnstile and
  the analytics origin; no inline scripts; `frame-ancestors 'none'`), `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`, and `Strict-Transport-Security` only when the proxy in front
  reports HTTPS. Written at build time by `scripts/security-headers.mjs` (with tests); more
  origins with the build argument `CSP_EXTRA_ORIGINS`. `server_tokens off`. Swagger UI and
  ReDoc (`DEBUG`) keep working without the policy.

## [0.4.0] - 2026-11-11

Permissions and control: actions by permission, Roles, Groups and Audit log pages, the
account's language, settings in tabs with a permission per group.

### Added
- Permissions: `can(user, 'leads.read')` and the `useCan(...)` hook (`src/modules/auth`) read the
  `permissions` the backend sends with the account. Menu items and `ProtectedRoute` take a
  `permission`; the admin sections Users and Leads ask for `users.read` and `leads.read`.
- `useRoleLabel()`: translated names of the built-in roles, other roles show as stored.
- Admin → Access → **Roles**: the roles with their permissions and users; create, edit and
  delete with `roles.manage`. Permissions are ticked in sections by area (texts from
  `GET /admin/permissions`); only those the editor has can be given or taken away, root is
  read-only, built-in roles keep their names, a role that users have is not deleted.
- Admin → Access → **Groups**: roles for several people at once; create, edit and delete with
  `roles.manage`. The members count opens the users list filtered by the group.
- Admin → Settings: a **tab per group** (left on wide screens, the open one kept in the URL as
  `?group=`), each group editable by its own permission (`editable` from the backend) — the
  read-only note shows per group. The **Mail** tab has a **Send a test email** button (to
  yourself with the saved settings; the mail server's error in a dialog).
- SchemaForm: `number` fields (`InputNumber` with the range from the backend and "at least /
  at most" messages), hints under fields (`help`), and with `secretHint` a note that a saved
  secret shows as `********` and is kept. Client rules moved to
  `src/components/SchemaForm/rules.ts` (with tests).
- The account's language: a **Language** section in the profile (emails and notifications come
  in it; hidden with one language), and the header switcher saves the choice of a signed-in
  user too. Signing in (password, sign-up, Google) opens the site in the account's language;
  an account without one gets the current language. `src/modules/auth/language.ts`;
  `switchLanguage` can open another page (`path`) and replace the history entry.
- Admin → Access → **Audit log** (`/admin/audit`, with `audit.read`): who changed what in the
  admin and when, from which IP, and the changes as "before → after" (role names instead of
  slugs, secrets stay masked). Search by email or target, filter by action (texts from
  `GET /admin/audit/actions`), sort, and a period with native date inputs (no date library);
  everything is kept in the URL.
- Admin → Users: a **Groups** column (filter, and the groups of a user are changed in place with
  `users.roles`). `src/modules/admin/access.ts`: `useRoles` / `useGroups` and the backend rules
  mirrored (`canEditRole`, `canGiveRole`, ...).

### Changed
- The settings page no longer asks for `settings.manage` (removed on the backend): every
  group says whether the user may change it.
- Admin pages show actions by permission instead of the role: export (`users.export`,
  `leads.export`), block and role change (`users.block`, `users.roles`), lead status and delete
  (`leads.manage`), settings (`settings.manage`), channels (`entities.manage`).
- `role` of a user is a string (the backend stores roles in the database).
- Admin → Users: the role is chosen from every role of the project (not only user and
  moderator), the role filter lists them all; actions are hidden for an account that may do
  more than the admin (its role and groups).
- Admin → Overview counts users for every role, with the names of the project's roles.

### Fixed
- Admin → Roles: the `user` role, given to every new account, shows its staff permissions
  greyed out with a note (the backend refuses them): a person becomes staff with another role
  or a group. `canGrant` in `src/modules/admin/access.ts`.

## [0.3.0] - 2026-11-11

Account and everyday tools: profile self-service, CSV export from the admin tables,
optional captcha on forms and sign-up.

### Added
- Profile: the user manages the account — name; password (current one asked; other devices
  are signed out); email (confirmed again); **Sign out everywhere**; **Delete account** with a
  confirmation (password, or the email for accounts that sign in only with Google; root cannot).
  Server errors appear under the right field. All in the lazy profile chunk.
- `useAuthStore` `setUser` / `clear`; account calls in `src/modules/auth/api.ts`.
- CSV export: `DataTable` `onExport` adds an **Export CSV** button that gets the current
  search, sort and filters; Admin → Users and Leads download every matching row
  (`/admin/users/export`, `/admin/leads/export`) in the interface language.
  `downloadFile` (`src/api/download.ts`) saves a file from the API with ordinary error messages.
- Optional captcha: when the backend turns it on (`/bootstrap` `captcha`), forms from
  `SchemaForm` and the sign-up page show the Cloudflare Turnstile widget and send its token in
  `X-Captcha-Token`. `useCaptcha` (`src/components/Captcha`) for other forms; the Cloudflare
  script is loaded only when the captcha is on. No new dependencies.

### Changed
- API types regenerated (`/auth/me/*`, `name`, the export endpoints, `captcha` in `/bootstrap`).

## [0.2.0] - 2026-11-10

The `standard` profile: sign-in and areas, admin (overview, users, leads, settings,
delivery channels), my files, notifications, sign-in with Google.

### Added
- Admin overview: users (total, active, by role) in one card; leads (total, new, done) with a
  bar chart of the last 14 days; delivery channels set up / enabled; the system — template
  profile, version, languages, modules on and off. `BarChart`: a small chart in HTML and CSS,
  no chart library.
- Breadcrumbs on the overview: Admin / Overview (`indexTitles`).
- Menu items can have `children`: a submenu that opens on its current page; groups
  with no visible children are hidden.
- Sign-in with Google: a **Continue with Google** button on the sign-in and sign-up pages
  for every provider in `/bootstrap` `auth_providers`, and the page
  `/oauth/<provider>/callback` that finishes the sign-in (once, also in Strict Mode) and opens
  the user's start page; a cancelled or failed sign-in is explained with a way back.
- Notifications module (`src/modules/notifications`, `notifications` capability): a bell in
  the header with the unread count (refreshed every minute while the page is visible and when
  it becomes visible again), the latest notifications, open-and-mark-read, **Mark all read**;
  lazy-loaded, with an accessible label that includes the count.
- Files module (`src/modules/files`, `files` capability): **My files** in the user area —
  drag-and-drop upload of several files with progress, a server-side table with search,
  size and upload time, download links, delete with confirmation; a menu item for
  signed-in users. `formatSize` with unit tests.
- Admin → Channels: lead delivery channels (email, Telegram, webhook) — list with on / off
  switches, add and edit in a form generated from the type, **Test** (shows the receiver's
  error), delete. Read-only for moderators. Enter submits the form.
- The lead drawer shows the delivery result per channel (sent / failed, time, error).
- `SchemaFields` `namePrefix` for nested values; `password` field type.
- Per-field server errors for nested fields (`params.chat_id`) appear under the right field.
- Admin → Leads: stored form submissions in a server-side table (received, form, a short
  summary, status) with search and filters in the URL; a drawer shows every answer under its
  translated label (option labels, yes / no) with **Mark done / new** and **Delete**.
- `utc()` in `src/api/dates.ts` for backend times (moved from the users page).
- Pages for links from emails: `/verify-email` (confirms once, also when the page renders
  twice), `/forgot-password` (same answer for any address) and `/reset-password` (a used or
  expired link offers a new one). **Forgot password?** on the sign-in page.
- A notice with **Send again** on the dashboard and profile until the email is confirmed;
  the profile shows the email status.
- `PasswordFields`: password and repeat fields shared by sign-up and reset.
- Admin → Users: a server-side table (`GET /admin/users`) with search by email, role and
  status filters, sorting and pages kept in the URL; block / unblock with confirmation and a
  role select for root. Actions appear only where the backend allows them.
- `DataTable` `refreshKey` prop: reloads the current page of remote data.
- Admin → Settings: one card per backend settings group, rendered from its description;
  saving (root only) re-reads `/bootstrap`, so the site name, footer contacts and
  languages change without a reload. Moderators see the settings read-only.
- `SchemaFields` (fields of a description inside any Ant Design form) and the `multiselect`
  field type.
- Site contacts (email, phone) in the footer when they are set.
- `useBootstrapStore.refresh()`: re-reads `/bootstrap` in place.
- Areas: the user's `areas` from the backend decide the landing page after sign-in
  (`root` / `moderator` → `/admin`, others → `/dashboard`), the guards
  (`<ProtectedRoute area="...">`) and a switch between the admin and client areas in the
  user menu.
- Admin overview with real user counters (`/admin/overview`); client dashboard shows data
  from `/client/summary`.
- `PageContainer` `noindex` prop; account and admin pages use it.
- Role names translated.

### Changed
- Home: the **API docs** button only when the backend serves them (`/bootstrap` `api_docs`);
  the version tag only once it is known.
- A request refused by the proxy for its size (413 without a JSON body) is explained instead of
  "Something went wrong".
- Profile: the **Edit** button that did nothing is removed.
- The client area is now the user area: `Area` `'user'`, `AREA_HOME.user`, `area="user"`,
  **User area** in the user menu (backend `areas` and `/user/*`).
- One profile page `/profile` for every role: `/admin/profile` removed, so the profile no longer
  shows Admin in its breadcrumbs.
- Side menu: items and submenu titles have the same inset, so icons line up.
- API types regenerated (`/user/summary`, `/admin/leads/stats`).
- Admin menu: Overview, Users, Leads, then **Settings** with **General** and **Channels**;
  channels moved to `/admin/settings/channels`.
- The user area starts on the home page: **My account** is now **User area** and opens `/`,
  ordinary users land there after sign-in.
- nginx (Docker): `X-Forwarded-For` is set to the client address instead of appended to, so a
  client cannot bypass the backend rate limits with its own header; request bodies up to 1 MB,
  uploads to `/api/v1/files` up to 11 MB (the default 1 MB broke files over 1 MB).
- The signed-in user is fetched once on start, not on every bootstrap change.
- The admin area uses the main shell with its own menu (`src/modules/admin/navigation.ts`);
  `AdminLayout` removed. The Admin item left the main menu (use the user menu switch).
- Menu items take `area` instead of `roles`; `visibleNavItems` filters them.
- User menu built from Ant Design menu items (keyboard accessible).
- API types regenerated: `/client/*` and `/admin/*` paths, `UserRead.areas`.

### Fixed
- My files: two uploads of files with the same name no longer share one progress bar.
- Prerender: a `$&` or `$'` in a title or description is kept as typed.

### Removed
- The client dashboard page `/dashboard` (an example without content); the backend example
  endpoint `/client/summary` stays.
- Unused `src/types/api.ts` and `getAdminUsers` (the users list returns in the admin users stage).

## [0.1.0] - 2026-11-07

First release: the `minimal` profile.

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
- Home: removed the repository links under the capabilities card (the buttons above link to both).
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
- The side menu no longer slides under the header at the bottom of a page: the footer now sits
  in the content column next to the menu.
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

[Unreleased]: https://github.com/rastal88/osnova_frontend/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/rastal88/osnova_frontend/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/rastal88/osnova_frontend/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/rastal88/osnova_frontend/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/rastal88/osnova_frontend/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/rastal88/osnova_frontend/releases/tag/v0.1.0
