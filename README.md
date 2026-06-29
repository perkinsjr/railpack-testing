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
