## Current user direction — 2026-09-08

This section supersedes older conflicting direction in this repository.

- Active working repository: `xrkr80hd/glc_live_app_9.7.2026`.
- Build the unified Liberty Church Next.js PWA here.
- `xrkr80hd/glc_live_site` is the current PHP/static public-site source and may be inspected/copied from as the public foundation.
- Do NOT modify, deploy, repoint, or cut over the current live PHP website, its hosting, or DNS during this phase.
- The older application implementation is a reuse/reference source for auth, profiles, roles, dashboards, admin tools, and other application functionality.
- Pushes to this repository are explicitly authorized and may deploy to the safe Vercel preview project `glc-new-preview` (`prj_cBDegCZgScr5e8qb9f6zjqXnL2An`).
- Approved test Supabase project: `ywfvbgblyuqwofejmasv`. Do not substitute another project.
- Keep the public `Login` entry visible in the top navigation.
- Preserve Youth as a standalone styling exception and regression-test it after shared/global changes.
- Never print or commit service-role/private secrets.

## Required control files

Before architectural or implementation work, read and obey:

- `README_FIRST.md`
- `00_MASTER_DIRECTIVE.md`
- `01_IMPLEMENTATION_WORKBOOK.md`
- `02_QA_MASTER_CHECKLIST.md`
- `PLANNED_WORK.md`

After meaningful work, update `COMPLETED_WORK.md` and the workbook where applicable.

Newest explicit user direction always supersedes older contradictory checkpoints.

# Agent Execution Policy

## Task workflow

1. LICL: inspect the current code and both relevant sources before editing.
2. Read `PLANNED_WORK.md` and continue the current priority.
3. Preserve proven working functionality.
4. Implement in the Next.js working repository, not in the live PHP deployment.
5. Push changes to `main` when ready for preview testing; preview deployment is authorized.
6. Build/test the deployed preview.
7. Check `02_QA_MASTER_CHECKLIST.md`, including separate Youth regression after shared visual changes.
8. Fix failures and retest.
9. Record completed work and remaining blockers.

## Reference-source rule

Use the PHP/static source to preserve current Liberty Church public:

- pages
- content
- navigation
- imagery
- visual identity
- livestream/public behavior
- forms and public workflows

Rebuild/port that behavior into Next.js under:

- `app/`
- `components/`
- `lib/`
- `public/`
- `supabase/` when test-backend work is required

Use the previous app implementation selectively for reusable authenticated functionality. Do not blindly preserve old UI or old architecture when it conflicts with the Master Directive.

## Preview safety boundary

Allowed during this phase:

- edit/push `glc_live_app_9.7.2026`
- deploy/test `glc-new-preview`
- use the designated test Supabase project
- inspect/reference `glc_live_site`

Not allowed without explicit cutover authorization:

- deploy changes to the live PHP site
- change live hosting files
- change live DNS/domain routing
- replace the current public production site

## Quality guardrails

- Do not claim UI-only features work without testing.
- Do not substitute mock data for required real behavior unless clearly marked temporary and authorized.
- Do not rebuild before inspecting equivalent PHP/app functionality.
- Keep public and authenticated experiences cohesive.
- Support one account/profile with multiple roles.
- Prefer shared workflows/entities over disconnected role-specific mini-apps.
- Keep the application usable on desktop, mobile browser, and installed PWA.
