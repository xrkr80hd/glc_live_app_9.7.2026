# golibertychurch.app

Next.js application for Liberty Church with:

- homepage + youth + sermons + live + prayer + visit routes
- YouTube API integration for live detection and sermons
- Supabase-backed content and form submissions
- staged archived-sermons schema and migration files

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill environment variables
3. Run:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker (Local Development)

1. Copy `.env.example` to `.env.local` and fill real values as needed.
2. Start Docker Desktop.
3. Run:

```bash
docker compose up --build
```

4. Open `http://localhost:3002`

Notes:
- The host port defaults to `3002` to avoid common local conflicts.
- To use another port, run with `GLC_DOCKER_PORT=3010 docker compose up --build`.
- Stop with `docker compose down`.

## Supabase SQL

- `SUPABASE_SCHEMA.md`
- `ARCHIVED_SERMONS_SCHEMA.sql`
