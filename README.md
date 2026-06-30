# testing-railpack

A minimal pnpm monorepo for testing [railpack](https://railpack.com) integration with Unkey. All data is mocked — the code exists only to exercise the build/deploy path and `workspace:` dependency resolution.

## Layout

```
.
├── pnpm-workspace.yaml        # workspaces: apps/*, packages/*
├── package.json               # root scripts
├── apps/
│   ├── api/                   # @repo/api  — node http server, no build (port 3001)
│   └── web/                   # @repo/web  — Vite build → static server (port 3000)
└── packages/
    └── reference/             # @repo/reference — shared mocked data/utils
```

Both apps depend on the shared package via a **workspace protocol** reference:

```jsonc
// apps/api/package.json & apps/web/package.json
"dependencies": { "@repo/reference": "workspace:*" }
```

## Usage

```bash
pnpm install          # links @repo/reference into both apps
pnpm dev              # runs all apps in parallel
pnpm --filter @repo/api start   # api on :3001
pnpm --filter @repo/web start   # web on :3000
```

Both services honor the `PORT` env var (handy for railpack/Railway).

### Endpoints

- **api**: `GET /health`, `GET /keys`, `GET /verify?id=key_001`
- **web**: `GET /` (Vite-built page; mocked keys bundled in), `GET /health`

The **web** app has a real build step: `vite build` bundles `src/main.js`
(which imports `@repo/reference`) into `apps/web/dist/`, and `pnpm start` runs
`server.js` to serve that output. The **api** app needs no build — it's a plain
node service — which is itself a valid railpack case to test.

## Deploying with railpack

Each app ships its own railpack config so the two services deploy **individually
from the same repo**:

- `apps/api/railpack.json`
- `apps/web/railpack.json`

> [!IMPORTANT]
> **Each service's Root Directory MUST be the repo root — _not_ `apps/api` / `apps/web`.**
>
> If you set the root directory to the app folder, railpack only sees that folder.
> It finds no `pnpm-workspace.yaml`, no `pnpm-lock.yaml`, and no root
> `packageManager` field, so it falls back to **npm**, which then fails with:
>
> ```
> npm error code EUNSUPPORTEDPROTOCOL
> npm error Unsupported URL Type "workspace:": workspace:*
> ```
>
> `workspace:*` can only be resolved by pnpm from the workspace root. Keep the
> root directory at the repo root and select the service via `RAILPACK_CONFIG_FILE`.

Point each service at its config with the `RAILPACK_CONFIG_FILE` env var:

| Service | Root Directory | `RAILPACK_CONFIG_FILE`   |
| ------- | -------------- | ------------------------ |
| api     | _repo root_    | `apps/api/railpack.json` |
| web     | _repo root_    | `apps/web/railpack.json` |

### What each config does

1. **install** — explicitly runs `corepack enable && pnpm install --frozen-lockfile`
   from the repo root, so railpack never guesses npm. This installs the whole
   workspace and links `@repo/reference` into the apps.
2. **build** — overridden to `pnpm --filter @repo/<app>... run build`, which builds
   only that app *and its workspace dependencies* (e.g. `@repo/reference`).
3. **deploy** — `startCommand` is `pnpm --filter @repo/<app> start`, so each
   container runs just one service.

Both services read `PORT` from the environment, which railpack/Railway inject
automatically.
