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

## Supabase SQL

- `SUPABASE_SCHEMA.md`
- `ARCHIVED_SERMONS_SCHEMA.sql`

