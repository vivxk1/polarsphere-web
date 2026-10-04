# PolarSphere 360 — Web

Next.js 14 frontend for **SIH 2026 / PS 26063**. It talks to the
[`polarsphere-360-api`](https://github.com/vivxk1/polarsphere-360-api) FastAPI service and renders every
response inside the `{ data, provenance }` envelope the API returns.

No mocks. Every number, document and answer on these pages comes from a live request.

## Requirements

| Requirement | Notes |
|---|---|
| Node.js 18+ | Node 22 recommended |
| The API running | `uvicorn app.main:app --port 8000` inside `polarsphere-360-api` |
| Docker | Only needed because Postgres + pgvector run in it |

## Run

```bash
cp .env.example .env.local     # optional; default points at 127.0.0.1:8000
npm install
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

If the API is on another host, set `NEXT_PUBLIC_API_BASE` in `.env.local` **and** add that origin to
`CORS_ORIGINS` in the API's `.env`. Otherwise the browser will block the request.

## Pages

| Route | What it does |
|---|---|
| `/` | Repository KPIs, station and expedition overview, quick-ask box |
| `/discover` | Hybrid search over documents, datasets and media, with station and type filters |
| `/polar-ai` | RAG chat. Answers are grounded in retrieved passages; `[n]` markers link to source cards |
| `/expeditions`, `/expeditions/[id]` | Season detail, timeline, team, route map |
| `/stations`, `/stations/[id]` | Station facts, latest observation, linked datasets and documents |
| `/data` | Dataset catalogue plus on-demand statistics with a sparkline |
| `/outreach` | Generate a draft, then advance it through the five-stage approval workflow |
| `/admin/ingest` | Upload a PDF/TXT, watch it get chunked, embedded and indexed |

## How it talks to the API

`lib/api.ts` holds one function per endpoint and unwraps the envelope. `lib/useApi.tsx` is a small hook
that exposes `{ data, provenance, loading, error, refetch }`.

Every page also renders a provenance strip (source, mode, latency, model) so it is always visible that
the data came from a real service rather than a fixture.

The map uses Leaflet with CARTO dark tiles, loaded client-side only — it has no build-time or SSR
dependency.

## Notes

- Built with the App Router. Pages are client components that fetch on mount, so `next build` does not
  require the API to be running.
- `useSearchParams` pages (`/discover`, `/polar-ai`) are wrapped in `Suspense`, which Next 14 requires.
- No ESLint config is included. `npm run typecheck` runs `tsc --noEmit` if you want a strict check.

## Known gaps

- Seed corpus is synthetic. Point the ingest pipeline at real NCPOR PDFs to make the demo authoritative.
- Media thumbnails are placeholder paths; there is no object storage wired up.
- The generator is a local 1.5B model — good English, mediocre Hindi.
