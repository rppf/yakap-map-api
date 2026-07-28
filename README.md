# yakap-map-api

The API of YAKAP Map — accredited PhilHealth YAKAP facilities, served from a Cloudflare Worker.

## Stack

- **Hono** — HTTP API (routes under `src/routes/`)
- **Cloudflare Workers** — serverless runtime (`wrangler`)
- **Neon** — serverless PostgreSQL (queried via Neon's HTTP driver adapter)
- **ZenStack v2** — schema + access policies (`zenstack/schema.zmodel`), generates the Prisma schema/client

## Directory layout

```
zenstack/schema.zmodel   # Source of truth for the API's view of the data model (edit this)
prisma/                  # Generated Prisma schema (+ migrations if needed later)
src/
  index.ts               # Worker entrypoint
  app.ts                 # Hono app: middleware, route mounting, AppType export
  lib/db.ts              # Neon HTTP adapter -> PrismaClient -> ZenStack enhance()
  middleware/            # CORS, error handler
  routes/health.ts       # GET /health
  routes/facilities/     # GET /api/facilities, GET /api/facilities/:id
```

## Setup

The Neon database and facility data are managed outside this repo — no migrations or
seeding are run here. The zmodel is aligned to the existing table via introspection.

```bash
pnpm install
cp .env.example .env               # fill in your Neon DATABASE_URL (used by prisma CLI)
cp .dev.vars.example .dev.vars     # same DATABASE_URL (used by wrangler dev)
pnpm generate                      # zenstack generate + prisma generate
pnpm dev                           # http://localhost:8787
```

## Scripts

| Script       | Purpose                                     |
| ------------ | ------------------------------------------- |
| `dev`        | `wrangler dev` local server                 |
| `deploy`     | `wrangler deploy --minify`                  |
| `generate`   | Regenerate Prisma schema/client from zmodel |
| `typecheck`  | `tsc --noEmit`                              |

## Endpoints

- `GET /health`
- `GET /api/facilities` — query params: `bbox=minLng,minLat,maxLng,maxLat` (Mapbox bounds order), `q` (name/street/municipality), `region`, `area`, `limit` (default 50, max 200), `offset`. Returns `{ data, meta: { total, limit, offset } }`.
- `GET /api/facilities/:id`

Backed by the existing `health_facilities` table in Neon. The PostGIS `coordinates`
column is not queryable via Prisma — geo filtering uses the plain `longitude`/`latitude`
columns. `id` is a BigInt in the DB and is serialized as a number in responses.

## Workflow notes

- **Schema changes**: the Neon table is the source of truth. After changing it, run
  `pnpm prisma db pull` and reconcile `zenstack/schema.zmodel` (field names, `@map`/`@@map`),
  then `pnpm generate`.
- **Reads** go through the ZenStack-enhanced client (`@@allow('read', true)`; writes are denied).
- For production secrets: `wrangler secret put DATABASE_URL` (don't commit real credentials).
- The web app (`yakap-map-web`) can consume the typed API via `hono/client` with the exported `AppType` from `src/app.ts`.
