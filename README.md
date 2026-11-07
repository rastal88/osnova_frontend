# Osnova Frontend

[![CI](https://github.com/rastal88/osnova_frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/rastal88/osnova_frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**SPA-интерфейс для проекта [Osnova](https://github.com/rastal88/osnova_backend)** —
универсального full-stack шаблона для быстрой разработки web-приложений.

Этот проект является клиентской частью Osnova и **работает в связке с бэкендом
`osnova_backend`**, взаимодействуя с ним исключительно через REST API.

## Стек

- React 19 + TypeScript
- Vite (сборка, HMR, режимы dev/prod)
- Zustand — управление состоянием
- Ant Design — UI-компоненты
- Axios — сетевой слой, React Router — маршрутизация
- Biome — линтинг и форматирование, Playwright — e2e-тесты
- `@hey-api/openapi-ts` — типы API из `openapi.json` бэкенда (`src/api/generated`)

## Возможности

- Аутентификация и регистрация (при `AUTH_ENABLED` на бэкенде)
- Защищённые маршруты с ролевым доступом (`ROOT`, `MODERATOR`)
- Административная панель (при `ADMIN_ENABLED`)
- Динамическая конфигурация через `bootstrap` (тема, capabilities)
- Светлая/тёмная тема
- Forms rendered from their backend description, with client and server validation
- Legal pages (privacy, terms, cookies): placeholders, owner details in `src/config/legal.ts`
- Cookie banner when analytics is on (`VITE_ANALYTICS_SCRIPT`): the script loads only after consent

## Структура

```
src/
├── api/          # Axios-клиент и bootstrap
├── store/        # Zustand-сторы ядра (bootstrap)
├── routes/       # маршрутизация из capabilities + lazyElement()
├── pages/        # публичные страницы ядра (Home, 404, ошибка)
├── components/   # каркас: Layout, PageContainer, PageState, Seo, ...
├── config/       # навигация и редиректы
├── modules/      # опциональные модули — каждый в своей папке
│   ├── auth/     # вход, регистрация, профиль, ProtectedRoute  ← authentication
│   └── admin/    # раздел /admin для root/moderator          ← admin
├── types/        # общие TypeScript-типы
└── utils/        # константы и утилиты
```

**Модуль = папка.** Модуль экспортирует свои маршруты из `modules/<name>/index.tsx`,
страницы подключаются через `lazyElement()` и попадают в отдельные чанки: если
capability выключена или страница не открыта, её код не скачивается. Удалить модуль —
удалить папку и его подключение в `src/routes/routes.tsx`.

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # optional: all values have defaults
npm run dev
```

По умолчанию фронтенд обращается к бэкенду по адресу `http://localhost:8000/api/v1`.

Env files: only `.env.example` is committed; local values go to `.env.local`
(ignored by git). Every `VITE_*` value ends up in the public JavaScript bundle, so
frontend env files must never contain secrets — they belong on the backend.

### Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка (tsc + vite) |
| `npm run generate:client` | Типы API из `../osnova_backend/openapi.json` (после `make openapi` на бэкенде; результат коммитится) |
| `npm run lint` | Biome: lint, format and import order check |
| `npm run format` | Biome: fix formatting and safe lint issues |
| `npm run typecheck` | TypeScript check (`tsc -b`) |

## Связь с бэкендом

- Базовый URL API — переменная `VITE_BASE_URL` (например, `http://localhost:8000/api/v1`).
- Авторизация — cookie/JWT, межстраничный редирект на `/login` при `401`.
- Конфигурация возможностей — через `GET /api/v1/bootstrap`.

## Развёртывание (Docker)

Образ собирается в два этапа (Node build → nginx) и раздаёт SPA, проксируя `/api`,
`/docs`, `/openapi.json`, `/redoc` на сервис `backend` (один origin — без CORS).

```bash
docker build --build-arg VITE_BASE_URL=/api/v1 --build-arg VITE_SITE_URL=https://example.com -t osnova-frontend .
```

Build variables for SEO and link previews: see `DEVELOPMENT.md` → "SEO and link previews".

В составе всей системы запускается из `osnova_backend` через `docker compose`
(сервис `frontend`), см. README основного репозитория.

Полное описание архитектуры, профилей `minimal` / `standard` / `scalable` и механизма
capabilities — в README основного репозитория:
[**osnova_backend**](https://github.com/rastal88/osnova_backend).

## Roadmap, участие, лицензия

- Общий план: [ROADMAP.md](https://github.com/rastal88/osnova_backend/blob/main/ROADMAP.md), изменения: [CHANGELOG.md](CHANGELOG.md).
- Как участвовать: [CONTRIBUTING.md](CONTRIBUTING.md), безопасность: [SECURITY.md](SECURITY.md).
- Лицензия: [MIT](LICENSE).
