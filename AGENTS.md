## Current user direction — 2026-09-07

This section supersedes conflicting historical instructions below.

- Active project name: `glc_live_app_9_7_2026`.
- Source baseline: the uploaded app (`glc_live_app-main.zip`). Its source files were byte-for-byte identical to repository main at `671a28f5c135a20e80db9dfd58adad996227cacc` when checked.
- Repository destination: `https://github.com/xrkr80hd/glc_live_app_9.7.2026.git`. Git pushes are authorized. The user confirms this repository does not serve the live site.
- Build the app and its existing public pages. Do not use `glc_live_site` as the build source or merge its site files into this app. Earlier site audits remain historical evidence only.
- This is a test environment. Do not change the live PHP site, its hosting, domains, or production database. Final cutover is a separate task.
- Approved Supabase test project: `ywfvbgblyuqwofejmasv`; current connector returns permission denied. Do not substitute the fitness database.
- User-specified Vercel project: `prj_Mfe4wogitvlctngsjHX2Gemxj5iZ`; current connected team returns 404. Do not substitute another project.
- Preserve Youth's distinct appearance and standalone CSS requirement; test it independently after shared styling changes.
- Reuse the existing restricted YouTube key already identified in the supplied material. Never print it or commit it. No request for a replacement/upload is needed. Transfer and restriction verification remain pending.
- Continue the staged QA loop, starting with baseline runtime verification. Do not mark login, database, visual, or installed-PWA QA passed without testing.

## Current working instructions

Use this repository root as the active workspace, not the historical external-drive path. Read `00_MASTER_DIRECTIVE.md`, `01_IMPLEMENTATION_WORKBOOK.md`, and `02_QA_MASTER_CHECKLIST.md`. Maintain those documents plus the planned/completed logs. These explicitly required control documents supersede the old three-markdown-file limit.

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
