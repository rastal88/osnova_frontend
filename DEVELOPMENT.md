# Osnova Frontend — инструкция для разработчика

Этот документ описывает как работать с каркасом фронтенда, как добавлять новые страницы, настраивать навигацию и использовать общие компоненты.

> **Важно**: текущий уровень готовности — минимальный набор (minimal mode). Полную документацию планируется добавить в README.md.

---

## 1. Каркас и навигация

### 1.1. Общий каркас

Каркас реализован в `src/components/LayoutComponent/LayoutComponent.tsx`.

- **Шапка** (`Header`): бренд (слева), меню/триггер (центр), тема + профиль (справа).
- **Футер** (`Footer`): © год и имя приложения.
- **Контент**: `<Outlet />` — страницы рендерятся без вложенного каркаса.
- **Мобильное меню**: при `md < false` в шапке появляется кнопка, которая открывает `Drawer`.

Позиция меню задаётся в `navigationConfig`.

### 1.2. Настройка навигации

Файл: `src/config/navigation.ts`

```ts
export const navigationConfig: NavigationConfig = {
  enabled: true,               // включить/выключить меню
  position: 'top',             // 'top' | 'left' | 'right'
  showBrand: true,             // показывать бренд в шапке
  showBreadcrumbs: true,       // показывать хлебные крошки (если > 1 уровня)
  items: [
    { path: '/', label: 'pages.home', icon: HomeOutlined },
    { path: '/dashboard', label: 'pages.dashboard', icon: DashboardOutlined, capability: 'authentication' },
    { path: '/admin', label: 'pages.admin', icon: SettingOutlined, capability: 'admin' },
  ],
};

export const redirects = [
  { from: '/home', to: '/' },  // редиректы
];
```

- **Пункт меню**: `path`, `label` (ключ перевода из `common`), опционально `icon` (Antd Icon компонент), `capability` (кнопка скроется если фича отключена).
- **Свобода**: чтобы убрать пункт, удалите его из `items` — страница останется доступной по URL.
- **Редиректы**: добавляйте пары `{from, to}`.

### 1.3. PageContainer — единая рамка страницы

Компонент: `src/components/PageContainer/PageContainer.tsx`

```tsx
import PageContainer from '../../components/PageContainer/PageContainer';

const MyPage = () => (
  <PageContainer
    title="Заголовок страницы"
    subtitle="Подзаголовок (опционально)"
    actions={<Button type="primary">Действие</Button>}
    loading={isLoading}
    error={hasError}
    forbidden={accessDenied}
    empty={items.length === 0}
    emptyText="Нет данных"
  >
    <div>Контент страницы...</div>
  </PageContainer>
);
```

**Пропсы**:
- `title` — заголовок (h3).
- `subtitle` — дополнительный текст под заголовком.
- `actions` — кнопки справа от заголовка.
- `breadcrumbs` — массив `{title, path}` (если не указан — вычисляется из `routeTitles` в навигации).
- `loading`, `error`, `forbidden`, `empty`, `emptyText` — состояния.

**Состояния** (в приоритете: loading > error > forbidden > empty > content):
- `loading` — `Spin`.
- `error` — `Result status="500"` с кнопкой "Try again".
- `forbidden` — `Result status="403"`.
- `empty` — `Empty` с кастомным текстом.
- `not-found` — 404 страница (автоматически при `*` роуте).

### 1.4. 404 и ошибка

- **Страница 404**: `src/pages/NotFound/NotFound.tsx`. Попадает при неизвестных путях.
- **Страница ошибки**: `src/pages/Error/Error.tsx`. Попадает при критическом UI-ошибке.
- **ErrorBoundary**: `src/components/ErrorBoundary/ErrorBoundary.tsx`. Оборачивает весь роутер в `AppComponent`.

---

## 2. Языки и SEO (B)

### 2.1. Translations

- Library: react-i18next. Setup: `src/i18n/index.ts`.
- Files: `src/locales/<language>/<namespace>.json`. Namespaces: `common` (shell, states,
  errors), `home`, and one per module (`auth`, `admin`).
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
`src/locales/<code>` and translate, add its Ant Design locale to `src/i18n/antdLocale.ts`.

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

The backend returns `{code, message, fields?}` with `message` already translated
(it receives `Accept-Language`). Use `getErrorMessage(error)` from `src/api/errors.ts`
to show it; `getApiError(error)` gives the code and per-field errors.

---

## 3. Формы (C)

Пока заглушка. Скоро: конструктор форм, валидация, состояние отправки.

---

## 4. Внешний вид и данные (D)

- **Тема**: уже есть (light/dark) — переключается в шапке.
- **Бренд-токены**: CSS-переменные в `index.css`.
- **Блоки лендинга**: пока нет (контент —自由 разметка в каждой странице).
- **Таблицы**: использовать `antd Table` напрямую (пагинация, сортировка — по соглашению позже).
- **Форматы**: пока без `dayjs` (используется стандартный `Date.toLocaleString`).
- **Графики**: не подключены (когда понадобятся — одна библиотека).

---

## 5. Бэкенд (E)

Смотреть `osnova_backend`.

---

## 6. Юридическое (F)

- **Политика, условия, cookie**: пустые страницы (заглушки) — заполняются владельцем.
- **Cookie-баннер**: пока нет (нужен при использовании аналитики).

---

## 7. Инфраструктура (G)

- **Dev-запуск**: `npm run dev` (frontend) + backend (local или Docker).
- **Сборка**: `npm run build`.
- **Типы**: `tsc -b`.
- **Линт**: `biome lint .`.
- **Docker**: `make up-standard`.

---

## Как добавить новую страницу

1. Создать `src/pages/MyPage/MyPage.tsx`.
2. Обернуть контент в `PageContainer`.
3. Добавить пункт в `navigationConfig.items` (если нужна ссылка в меню).
4. Добавить маршрут в `routes.tsx` (если нужен отдельный путь, а не внутри `/`).
5. Протестировать (dev-сервер или `npm run build`).

---

## Частые задачи

| Задача | Как сделать |
|--------|-------------|
| Убрать меню полностью | `enabled: false` в `navigationConfig`. |
| Переместить меню влево | `position: 'left'`. |
| Скрыть пункт по фиче | `capability: 'authentication'` (и т.д.). |
| Добавить редирект | `redirects.push({ from: '/old', to: '/new' })`. |
| Показать 404 | `<Navigate to="*" replace />` или `*` роут (уже есть). |
| Использовать PageContainer | Обернуть `<PageContainer title="...">...</PageContainer>`. |

---

## Структура файлов (новые)

```
src/
├── config/navigation.ts       # конфиг навигации и редиректов
├── components/
│   ├── PageContainer/         # единая рамка страницы
│   ├── PageState/             # состояния: loading/empty/error/403/404
│   ├── ErrorBoundary/         # глобальный хендлер ошибок
│   └── LayoutComponent/       # общий каркас
└── pages/
    ├── NotFound/              # 404
    └── Error/                 # общая ошибка
```

---
