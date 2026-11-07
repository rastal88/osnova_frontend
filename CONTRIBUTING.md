# Contributing

Thanks for helping with Osnova! The project has two repositories:
[osnova_backend](https://github.com/rastal88/osnova_backend) and
[osnova_frontend](https://github.com/rastal88/osnova_frontend) (this one).
The shared plan is in the backend's [ROADMAP.md](https://github.com/rastal88/osnova_backend/blob/main/ROADMAP.md).

## Setup

```bash
npm install
npm run dev           # http://localhost:5173, expects the backend on http://localhost:8000
```

Start the backend from `../osnova_backend` (`make dev`), or the whole stack in Docker
there (`make up-minimal`).

## Workflow

1. Create a branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/).
3. Before pushing: `npm run lint` (Biome), `npm test` (Vitest) and `npm run build`
   (type check + build);
   `npm run format` fixes formatting.
4. Open a pull request using the template. CI must be green.
5. Note user-visible changes in [CHANGELOG.md](CHANGELOG.md) under *Unreleased*.

## Architecture rules

- The backend is the source of truth: routes and UI are built from `GET /api/v1/bootstrap`.
- **Module = folder.** Optional features live in `src/modules/<name>/`; `index.tsx` exports
  their routes. Pages are loaded with `lazyElement()` so a disabled or unvisited module is
  never downloaded.
- Core code imports a module only through its `index.tsx`.
