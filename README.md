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

## YouTube Wiring (Live + Sermons)

Use separate API keys if needed:

- `YOUTUBE_LIVE_API_KEY`
- `YOUTUBE_SERMONS_API_KEY`
- `YOUTUBE_LIVE_CHANNEL_ID`
- `YOUTUBE_SERMONS_CHANNEL_ID`

Legacy env names are still supported:

- `SUPABASE_NEW_LIVE_KEY`
- `SUPABASE_NEW_SERMONS_KEY`
- `YOUTUBE_CHANNEL_ID`

Both website routes (`/live`, `/sermons`) and member app routes (`/member/live`, `/member/sermons`) use the same shared content pipeline in `lib/content.js`.

Optional backend role visibility flag:

- `BOOKKEEPER_ORDER_VISIBILITY=true` allows Bookkeeper read visibility across ministry order requests for reporting.
- `ADMIN_MEMBER_UPGRADE_ROLE_KEYS=superuser,pastor` lets signed-in member accounts with these role keys auto-upgrade into admin session without a second login.

## Build

```bash
npm run build
```

## Role Demo Users

Create one dummy member account per dashboard role:

```bash
node scripts/seed-role-demo-users.mjs
```

Defaults:
- password: `DemoRole123!`
- login style: `short`
- email pattern (short mode): `d01@glc.local`, `d02@glc.local`, ...

Optional env overrides:
- `DEMO_MEMBER_PASSWORD`
- `DEMO_MEMBER_EMAIL_DOMAIN`
- `DEMO_MEMBER_LOGIN_STYLE` (`short` or `friendly`)
- `DEMO_MEMBER_SHORT_PREFIX` (default `d`)
- `NEXT_PUBLIC_APP_URL` (for printed links)

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
