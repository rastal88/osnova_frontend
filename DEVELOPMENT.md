# Osnova Frontend — developer guide

How to work with the frontend shell: add pages, configure navigation, use the shared
components, translations, forms and tables. The overview is in [README.md](README.md).

---

## 1. Shell and navigation

### 1.1. App shell

The shell is `src/components/LayoutComponent/LayoutComponent.tsx`.

- **Header**: brand on the left (and the menu button on phones); language, theme and
  profile on the right.
- **Side menu** (default): on the left, open on desktop; the button at its bottom collapses
  it to icons, and the choice is kept in `localStorage` (`app_menu_collapsed`).
- **Footer**: © year, app name and links to the legal pages.
- **Content**: `<Outlet />`; pages render inside the shell without their own frame.
- **Mobile menu**: below the `md` breakpoint the menu turns into a button that opens a `Drawer`.

The menu position is set in `navigationConfig`: `left` (default), `right` or `top`
(a horizontal menu in the header).

### 1.2. Navigation

File: `src/config/navigation.ts`

```ts
export const navigationConfig: NavigationConfig = {
  enabled: true,               // show the menu at all
  position: 'left',            // 'left' | 'right' | 'top'
  showBrand: true,             // brand in the header
  showBreadcrumbs: true,       // breadcrumbs (when there is more than one level)
  items: [
    { path: '/', label: 'pages.home', icon: HomeOutlined },
    { path: '/dashboard', label: 'pages.dashboard', icon: DashboardOutlined, capability: 'authentication', requiresAuth: true },
    { path: '/admin', label: 'pages.admin', icon: SettingOutlined, capability: 'admin', requiresAuth: true, roles: ['root', 'moderator'] },
  ],
};

export const redirects = [
  { from: '/home', to: '/' },
];
```

- **Menu item**: `path`, `label` (a key in the `common` translations), optional `icon`
  (an Ant Design icon), `capability` (hidden when the capability is off), `requiresAuth`
  and `roles` (shown only to signed-in users / these roles).
- Pages are not tied to the menu: remove an item and the page is still reachable by URL.
- **Redirects**: add `{ from, to }` pairs.
- **Breadcrumb titles**: `routeTitles` in the same file (path → translation key).

### 1.3. PageContainer — one frame for every page

Component: `src/components/PageContainer/PageContainer.tsx`

```tsx
import PageContainer from '../../components/PageContainer/PageContainer';

const MyPage = () => (
  <PageContainer
    title="Page title"
    subtitle="Optional subtitle"
    actions={<Button type="primary">Action</Button>}
    loading={isLoading}
    error={hasError}
    forbidden={accessDenied}
    empty={items.length === 0}
    emptyText="No data"
  >
    <div>Page content...</div>
  </PageContainer>
);
```

**Props:**
- `title` — heading; a string title also becomes the browser title.
- `seo` — SEO key of the page (see 2.4).
- `subtitle` — text under the title.
- `actions` — buttons to the right of the title.
- `breadcrumbs` — `{ title, path }[]`; computed from `routeTitles` when omitted.
- `maxWidth` — content width.
- `loading`, `error`, `forbidden`, `empty`, `emptyText` — states.

**States** (priority: loading > error > forbidden > empty > content): `loading` shows a
`Spin`, `error` a 500 result with **Try again**, `forbidden` a 403 result, `empty` an
`Empty` with your text. Unknown paths show the 404 page.

### 1.4. 404 and errors

- **404 page**: `src/pages/NotFound/NotFound.tsx`, for unknown paths.
- **Error page**: `src/pages/Error/Error.tsx`, for a crashed UI.
- **ErrorBoundary**: `src/components/ErrorBoundary/ErrorBoundary.tsx`, wraps the whole
  router in `AppComponent`; route errors go to `src/routes/RouteError.tsx`.

---

## 2. Languages and SEO

### 2.1. Translations

- Library: react-i18next. Setup: `src/i18n/index.ts`.
- Files: `src/locales/<language>/<namespace>.json`. Namespaces: `common` (shell, states,
  errors), `home`, `seo`, `forms`, `legal`, `examples` and one per module (`auth`, `admin`).
- English is the source language: add every key to `en` first. Keys are type-checked
  against the English files, so a typo fails `npm run build`.
- Only English `common` is in the main bundle; other files are separate chunks loaded
  when a page uses their namespace.
- Enabled languages and the default come from `/bootstrap` (`i18n`).

```tsx
const { t } = useTranslation('auth');
<h2>{t('login.title')}</h2>
```

**Add a language:** enable it on the backend (`LANGUAGES`), copy `src/locales/en` to
`src/locales/<code>` and translate, add its Ant Design locale to `src/i18n/antdLocale.ts`
and its Open Graph locale to `src/seo/head.js`.

### 2.2. Language in the URL

- Every page lives under a prefix: `/en/...`, `/ru/...`. The prefix is the router
  `basename`, so routes, `<Link to="/login">` and `navigate('/profile')` stay
  language-free.
- A URL without a prefix (`/`, an old `/login` link) is redirected to the saved
  choice, then the browser language, then the backend default.
- `LanguageSwitcher` (header and admin) keeps the current page, remembers the choice
  in `localStorage` and is hidden when only one language is enabled.
- Outside the router (plain `href`, `window.location`) use `localizedPath('/path')`
  from `src/i18n/language.ts`.

### 2.3. Server errors

The backend returns `{ code, message, fields? }` with `message` already translated
(every request sends `Accept-Language`). Use `getErrorMessage(error)` from
`src/api/errors.ts` to show it; `getApiError(error)` gives the code and per-field errors.

### 2.4. SEO and link previews

- `<Seo page="home" />` sets title, description, canonical, `hreflang` (+ `x-default`),
  Open Graph and Twitter tags. Texts: `src/locales/<language>/seo.json`.
  Other props: `title`, `description`, `image`, `noindex` (sign-in, account, admin, 404).
  `PageContainer` with a string `title` sets the page title automatically.
- **Prerender:** `npm run build` runs `scripts/prerender.mjs`. For each page in
  `src/config/prerender.json` and each language it writes `dist/<language>/<path>/index.html`
  with these tags already in `<head>`, so Telegram and social networks show a preview
  without running JavaScript. Only `<head>` is prerendered (no headless browser).
- It also writes `robots.txt` and, when `VITE_SITE_URL` is set, `sitemap.xml`.
- **Add a public page:** add it to `prerender.json` (`path`, `seo` key), add the key to
  every `seo.json` and to `SeoPage` in `src/components/Seo/Seo.tsx`.

Build variables:

| Variable | Purpose |
|----------|---------|
| `VITE_SITE_URL` | Public origin (`https://example.com`) for canonical, `hreflang`, `og:url`, sitemap. Without it these are skipped |
| `VITE_OG_IMAGE` | Default preview image (absolute URL or `/path` in `public/`) |
| `PRERENDER_API_URL` | Backend API to read languages from `/bootstrap` at build time (default: `VITE_BASE_URL` if absolute) |
| `VITE_LANGUAGES`, `VITE_DEFAULT_LANGUAGE`, `VITE_APP_NAME` | Fallback when the backend is not reachable (default: folders in `src/locales`, `en`, `Osnova`) |

---

## 3. Forms

Forms are described once on the backend (`app/forms.py` in osnova_backend) and rendered here:

```tsx
<SchemaForm name="contact" />
```

- `GET /forms/<name>` returns the title, submit label and fields (labels already in the
  current language); the form reloads it when the language changes.
- Field types: `text`, `textarea`, `email`, `tel`, `select`, `checkbox`, `consent`.
  Client rules (required, length, pattern, checked) come from the same description as the
  server ones, so most mistakes are caught before sending.
- A hidden honeypot field is rendered when the description has one; bots that fill it
  are answered as usual but their submissions are not delivered.
- `POST /forms/<name>`: per-field server errors are shown under the fields; any other
  failure shows an alert with **Try again**, which resends the same values. Success
  replaces the form with the server message and **Send another**.
- `consent` links to `PRIVACY_POLICY_PATH` (`src/utils/constants.ts`, `/privacy`).
- Generic texts (validation, retry, sending): `src/locales/<language>/forms.json`.
- Example page: `src/examples/contact` (`/examples/contact`, lazy-loaded — Ant Design form controls
  are in its own chunk, not in the main bundle).

---

## 4. Look and data

- **Brand and theme**: colours, radius and font live in `src/config/brand.ts` (light and dark
  palettes). Ant Design themes are built from it (`theme.ts`, default/dark algorithm), and
  `ThemeVariables` exposes the derived colours to custom CSS: `--color-primary`,
  `--color-primary-bg`, `--color-bg`, `--color-surface`, `--color-text`,
  `--color-text-secondary`, `--color-border`, `--color-fill`, `--radius`, `--shadow`...
  Use them instead of hex values; do not override Ant Design classes globally.
  The chosen theme is kept in `localStorage`.
- **Font**: Roboto WOFF2 subset (Latin + Cyrillic, ~23 KB per weight), see
  `src/assets/fonts/Roboto/README.md` to add a language or drop the font.
- **Landing blocks**: `src/components/blocks` — `Hero`, `Services`, `Gallery`, `Pricing`,
  `Reviews`, `Faq`, `Cta` and the `Section` wrapper (`id` for anchors, `tone`: plain / surface /
  primary). Content comes in props, texts from translations; styles use the brand variables.
  Example: `src/examples/landing` (`/examples/landing`).
- **Images**: `<Image image={...} alt sizes priority />` renders `<picture>` with AVIF / WebP,
  lazy loading, async decoding and fixed size (no layout jumps); `priority` for the first screen.
  Put originals in `src/assets/images/source` and run `npm run images` (sharp, dev only) to get
  640 / 1280 / 1920 px variants and `generated/index.ts` — see `src/assets/images/README.md`.
- **Tables**: `DataTable` (`src/components/DataTable`) wraps Ant Design `Table` with a search
  box, column filters, sorting and pagination. The state is in the URL (`?q=&page=&size=&sort=-total&status=paid,new`),
  so a filtered table survives a reload and can be shared; `urlPrefix` separates several tables.
  - `data={rows}`: everything runs in the browser (`searchable`, `sortable`, `filters` on columns).
  - `fetch={(query) => api...}`: the server gets `{ page, pageSize, search, sort, filters }`
    and returns `{ items, total }`; the table shows a loader and an error with retry.
  - Column `key` is the field name and the URL parameter, so `q`, `page`, `size`, `sort` are reserved.
    Define columns with `useMemo`.
- **Formatting**: `useFormat()` (`src/i18n/format.ts`) — `date`, `dateTime`, `time`,
  `relative` ("3 days ago"), `number`, `percent`, `compact`, `currency` in the interface
  language, built on `Intl` (no extra libraries). Default currency: `src/config/format.ts`.
- **Charts**: not included; add one library when a project needs them.

---

## 5. Backend API

- Requests go through `src/api/*` (Axios instance in `src/api/axios.ts`); there is no
  generated runtime client.
- Types come from the backend schema: after the backend API changes run `make openapi`
  there, then `npm run generate:client` here and commit `src/api/generated`. CI fails when
  they are out of date.

---

## 6. Legal

- **Pages** `/privacy`, `/terms`, `/cookies` (`src/pages/Legal`) with placeholder texts in
  `src/locales/<language>/legal.json`. Fill the owner details in `src/config/legal.ts`;
  while a value is still in `[brackets]` the pages show a "template" notice. Review the
  texts for your country and your data processing.
- **Analytics and cookie banner**: off by default. Set `VITE_ANALYTICS_SCRIPT` (script URL
  of your provider; in Docker the build argument of the same name) and a banner asks for consent; the script loads only after **Accept**
  (`src/config/analytics.ts`, `src/consent`). The choice is kept in `app_consent` and can be
  changed on the cookie policy page. Without analytics there is no banner.

---

## 7. Tooling

- **Dev server**: `npm run dev`, with the backend running locally or in Docker; or
  `make dev-all` in osnova_backend to start both.
- **Build**: `npm run build` (type check, Vite build, prerender).
- **Types**: `npm run typecheck` (`tsc -b`).
- **Lint and format**: Biome only (`biome.json`): `npm run lint` checks, `npm run format` fixes.
- **Tests**: Vitest, `npm test`. Tests sit next to the code as `*.test.ts` and cover pure logic
  (formatting, table query, navigation, language URLs, API errors); they run in Node, no browser.
- **Docker**: from osnova_backend, `make up-minimal` or `make up-standard`.

---

## Examples

`src/examples/` holds pages that show the building blocks in use: `/examples` (index),
`/examples/data` (formatting and tables), `/examples/landing` (landing blocks), `/examples/contact` (form).
They are lazy-loaded. To remove them: delete the folder, `exampleRoutes` in
`src/routes/routes.tsx`, the Examples item in `src/config/navigation.ts` and their
entries in `src/config/prerender.json`.

---

## Add a page

1. Create `src/pages/MyPage/MyPage.tsx` and wrap the content in `PageContainer`.
2. Add a route in `src/routes/routes.tsx` (inside the layout children for the shell).
3. Add its title key to `routeTitles` and, for a menu link, an item to `navigationConfig.items`.
4. For a public page with a link preview, add it to `src/config/prerender.json` (see 2.4).
5. Check it with `npm run dev`, then `npm run lint`, `npm test` and `npm run build`.

---

## Common tasks

| Task | How |
|------|-----|
| Hide the menu | `enabled: false` in `navigationConfig` |
| Menu on top | `position: 'top'` |
| Hide an item when a capability is off | `capability: 'authentication'` (etc.) |
| Add a redirect | add `{ from: '/old', to: '/new' }` to `redirects` |
| Change brand colours | `src/config/brand.ts` |
| Add a translation key | `src/locales/en/<namespace>.json` first, then other languages |
