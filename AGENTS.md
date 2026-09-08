## Current user direction — 2026-09-08

This section supersedes every older conflicting direction in this repository.

- Active working repository: `xrkr80hd/glc_live_app_9.7.2026`.
- Build ONE unified Liberty Church **native Next.js Progressive Web App** here.
- The uploaded/current PHP live-site source is a **READ-ONLY FOUNDATION AND REFERENCE** for Liberty Church content, assets, page intent, visual identity, public workflows, and proven behavior.
- The PHP source is **NOT** the target architecture. Do NOT turn the Next.js app into a PHP/static clone, preserve PHP routing, copy PHP backend architecture, or treat HTML/PHP parity as the goal.
- Re-implement useful PHP-site behavior natively with Next.js routes/components, JavaScript/React, Supabase-backed data where appropriate, and PWA infrastructure.
- The older application implementation is a reuse/reference source for authentication, profiles, roles, dashboards, admin tools, and other application functionality.
- Do NOT modify, deploy, repoint, or cut over the current live PHP website, its hosting, database, domain, or DNS during this phase.
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

When an older checkpoint conflicts with this file, **this current direction wins**.

After meaningful work, update `COMPLETED_WORK.md` and the workbook where applicable.

# Agent Execution Policy

## Task workflow

1. LICL: inspect the current Next.js code, the read-only PHP foundation, and reusable old-app functionality before editing.
2. Read `PLANNED_WORK.md` and continue the current priority.
3. Identify the user-facing intent/behavior to preserve; do not preserve obsolete implementation details merely because PHP used them.
4. Design the native Next.js/PWA implementation.
5. Implement only in `glc_live_app_9.7.2026`.
6. Push changes to `main` when ready for preview testing; preview deployment is authorized.
7. Build/test the deployed preview.
8. Check `02_QA_MASTER_CHECKLIST.md`, including separate Youth regression after shared visual changes.
9. Fix failures and retest.
10. Record completed work and remaining blockers.

## Reference-source rule

Use the PHP/static source to understand and preserve current Liberty Church public:

- pages and information architecture
- church content
- navigation intent
- imagery and brand assets
- visual character
- livestream behavior
- forms and public workflows
- proven visitor-facing functionality

Then rebuild that intent natively in:

- `app/` for Next.js routes/server handlers
- `components/` for React UI and reusable interactions
- `lib/` for application/domain logic
- `public/` for static assets and PWA files
- `supabase/` for test-backend schema/policies when required

Do **not** copy PHP endpoints simply to achieve parity when a cleaner Next.js/Supabase implementation already exists or should replace them.

Use the previous app implementation selectively for reusable authenticated functionality. Do not blindly preserve old UI or old architecture when it conflicts with the Master Directive or current user direction.

## Preview safety boundary

Allowed during this phase:

- edit/push `glc_live_app_9.7.2026`
- deploy/test `glc-new-preview`
- use the designated test Supabase project
- inspect/reference the uploaded/current PHP live-site source

Not allowed without explicit cutover authorization:

- commit to or deploy the live PHP site
- change live hosting files
- change live production database
- change live DNS/domain routing
- replace the current public production site

## Quality guardrails

- The product target is a real installable Next.js PWA, not a static-site wrapper.
- Do not claim UI-only features work without testing.
- Do not substitute mock data for required real behavior unless clearly marked temporary and authorized.
- Do not rebuild working app functionality before inspecting it.
- Keep public and authenticated experiences cohesive inside one PWA.
- Support one account/profile with multiple roles.
- Prefer shared workflows/entities over disconnected role-specific mini-apps.
- Keep the application usable on desktop, mobile browser, and installed PWA.
- Preserve church identity while improving implementation, responsiveness, maintainability, accessibility, and app-like behavior.
