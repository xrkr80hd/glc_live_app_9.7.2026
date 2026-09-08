## Current user direction — 2026-09-07

This section supersedes conflicting historical instructions below.

- Active project name: `glc_live_app_9_7_2026`.
- Source baseline: the uploaded app (`glc_live_app-main.zip`). Its source files were byte-for-byte identical to repository main at `671a28f5c135a20e80db9dfd58adad996227cacc` when checked.
- Repository destination: `https://github.com/xrkr80hd/glc_live_app_9.7.2026.git`. Git pushes are authorized. The user confirms this repository does not serve the live site.
- Build the app and its existing public pages. Do not use `glc_live_site` as the build source or merge its site files into this app. Earlier site audits remain historical evidence only.
- This is a test environment. Do not change the live PHP site, its hosting, domains, or production database. Final cutover is a separate task.
- Approved Supabase test project: `ywfvbgblyuqwofejmasv`; current connector returns permission denied. Do not substitute the fitness database.
- Confirmed Vercel test project (user corrected ID): `prj_cBDegCZgScr5e8qb9f6zjqXnL2An`, `glc-new-preview`, https://glc-new-preview.vercel.app. Latest verified deployment uses this repository main; the earlier project ID is superseded.
- Preserve Youth's distinct appearance and standalone CSS requirement; test it independently after shared styling changes.
- Reuse the existing restricted YouTube key already identified in the supplied material. Never print it or commit it. No request for a replacement/upload is needed. Transfer and restriction verification remain pending.
- Continue the staged QA loop, starting with baseline runtime verification. Do not mark login, database, visual, or installed-PWA QA passed without testing.

# Liberty Church Astra PWA Working System

Upload this package alongside Astra's copies of:

- `glc_live_site-main`
- `glc_live_app-main`

Astra must treat the included documents as a working control system:

1. `00_MASTER_DIRECTIVE.md` — permanent project vision, requirements, stages, and strict rules.
2. `01_IMPLEMENTATION_WORKBOOK.md` — living record Astra updates throughout the project.
3. `02_QA_MASTER_CHECKLIST.md` — mandatory QA gate used before, during, and after each stage.

## Mandatory Work Loop

INSPECT
→ DOCUMENT
→ PLAN
→ CHECK AGAINST MASTER DIRECTIVE
→ IMPLEMENT
→ BUILD / RUN
→ TEST
→ VISUALLY INSPECT
→ CHECK QA MASTER CHECKLIST
→ FIX FAILURES
→ RETEST
→ UPDATE IMPLEMENTATION WORKBOOK
→ ADVANCE ONLY AFTER PASS

The current live website is the public foundation of the PWA.
The old app is the existing authenticated/role foundation.
The end result is ONE cohesive Liberty Church Progressive Web App.
