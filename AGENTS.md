# Agent Execution Policy

## Active Build Workspace

Use this folder as the active Next.js app root:

`/Volumes/LaCie/GLC_LOCAL_LACIE_MAIN`

## Build/Run Commands Allowed Here

- `npm install`
- `npm run dev`
- `npm run build`
- `next dev`
- `next build`

## Startup Guardrail (Repo-Specific)

When starting this project locally, run side-by-side dev servers:

- Admin/CMS view (admin-only mode): `NEXT_DIST_DIR=.next-admin npm run dev` (default `http://localhost:3000/admin`)
- Website/public view: `ADMIN_ONLY_MODE=false NEXT_DIST_DIR=.next-site npm run dev -- --port 3001` (`http://localhost:3001`)

Keep both running for change validation unless the user requests a different setup.

## Task Workflow Guardrail

Before acting on a new task in this repo, LICL: inspect the current local code/context first.

Use the session work logs as the operating loop for ongoing work:

- Read `PLANNED_WORK.md` before starting or resuming queued work.
- Implement the current plan before jumping to newer steering, unless the user explicitly says `STOP` and reprioritizes.
- If the user raises a new issue but does not explicitly say `STOP`, add it to `PLANNED_WORK.md` and keep working through the current operation.
- After finishing a task, check `PLANNED_WORK.md` for anything missed.
- Log finished work in `COMPLETED_WORK.md`.
- Keep both files current as work changes.

The repo-visible markdown files are the source of truth for planned and completed work so other agents and tools in the workspace can read them.
Do not create or rely on additional repo markdown handoff/planning files.
Keep repo markdown limited to:

- `AGENTS.md`
- `PLANNED_WORK.md`
- `COMPLETED_WORK.md`

## Reference Sources

Legacy/PHP files in this folder are reference material. Rebuild behavior in Next.js app files under:

- `app/`
- `components/`
- `lib/`
- `supabase/`

Do not push/deploy automatically unless explicitly requested by the user.
