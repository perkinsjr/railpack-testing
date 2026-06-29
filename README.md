# testing-railpack

A minimal pnpm monorepo for testing [railpack](https://railpack.com) integration with Unkey. All data is mocked — the code exists only to exercise the build/deploy path and `workspace:` dependency resolution.

## Layout

```
.
├── pnpm-workspace.yaml        # workspaces: apps/*, packages/*
├── package.json               # root scripts
├── apps/
│   ├── api/                   # @repo/api  — node http server (port 3001)
│   └── web/                   # @repo/web  — node http server (port 3000)
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
- **web**: `GET /` (HTML table of mocked keys), `GET /health`

## Deploying with railpack

Each app ships its own railpack config so the two services deploy **individually
from the same repo**:

- `apps/api/railpack.json`
- `apps/web/railpack.json`

Railpack always builds from the **repo root** (it needs the full pnpm workspace +
`pnpm-lock.yaml`), so these configs are *not* auto-detected. Point each service at
its config with the `RAILPACK_CONFIG_FILE` env var:

| Service | `RAILPACK_CONFIG_FILE`     |
| ------- | -------------------------- |
| api     | `apps/api/railpack.json`   |
| web     | `apps/web/railpack.json`   |

Keep each service's **root directory at the repo root** (do not set it to the app
folder) — railpack needs the workspace to install dependencies.

### What each config does

1. **install** — auto-detected by railpack's node provider: it reads the root
   `packageManager` field, enables corepack, and runs the pnpm workspace install
   (with store caching).
2. **build** — overridden to `pnpm --filter @repo/<app>... run build`, which builds
   only that app *and its workspace dependencies* (e.g. `@repo/reference`).
3. **deploy** — `startCommand` is `pnpm --filter @repo/<app> start`, so each
   container runs just one service.

Both services read `PORT` from the environment, which railpack/Railway inject
automatically.
