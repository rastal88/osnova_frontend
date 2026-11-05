# Osnova Frontend

**SPA-интерфейс для проекта [Osnova](https://github.com/<org>/osnova_backend)** —
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
- `@hey-api/openapi-ts` — генерация API-клиента из OpenAPI бэкенда

## Возможности

- Аутентификация и регистрация (при `AUTH_ENABLED` на бэкенде)
- Защищённые маршруты с ролевым доступом (`ROOT`, `MODERATOR`)
- Административная панель (при `ADMIN_ENABLED`)
- Динамическая конфигурация через `bootstrap` (тема, capabilities)
- Светлая/тёмная тема

## Структура

```
src/
├── api/          # клиенты Axios и обёртки над эндпоинтами
├── store/        # Zustand-сторы (auth, bootstrap)
├── routes/       # маршрутизация (React Router)
├── pages/        # страницы (Home, Dashboard, Profile, Admin, ...)
├── components/   # компоненты (Layout, ProtectedRoute, Bootstrap, ...)
├── types/        # общие TypeScript-типы
└── utils/        # константы и утилиты
```

## Быстрый старт

```bash
npm install
# в .env.dev укажите адрес бэкенда, например:
#   VITE_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

По умолчанию фронтенд обращается к бэкенду по адресу `http://localhost:8000/api/v1`.

### Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка (tsc + vite) |
| `npm run generate:client` | Генерация API-клиента из OpenAPI бэкенда |
| `npm run lint` / `format` / `check` | Biome |

## Связь с бэкендом

- Базовый URL API — переменная `VITE_BASE_URL` (например, `http://localhost:8000/api/v1`).
- Авторизация — cookie/JWT, межстраничный редирект на `/login` при `401`.
- Конфигурация возможностей — через `GET /api/v1/bootstrap`.

## Развёртывание (Docker)

Образ собирается в два этапа (Node build → nginx) и раздаёт SPA, проксируя `/api`,
`/docs`, `/openapi.json`, `/redoc` на сервис `backend` (один origin — без CORS).

```bash
docker build --build-arg VITE_BASE_URL=/api/v1 -t osnova-frontend .
```

В составе всей системы запускается из `osnova_backend` через `docker compose`
(сервис `frontend`), см. README основного репозитория.

Полное описание архитектуры, профилей `minimal` / `standard` / `scalable` и механизма
capabilities — в README основного репозитория:
[**osnova_backend**](https://github.com/<org>/osnova_backend).
