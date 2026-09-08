## Current user direction — 2026-09-08

This section supersedes conflicting historical instructions in the repo.

- Active build repository: `xrkr80hd/glc_live_app_9.7.2026`.
- This repository is the safe Next.js/PWA working build and may be pushed/deployed to the Vercel preview project throughout development.
- Preview Vercel project: `glc-new-preview` (`prj_cBDegCZgScr5e8qb9f6zjqXnL2An`).
- Public-source reference: `xrkr80hd/glc_live_site`. It represents the current PHP/static Liberty Church public website and is the public content/visual/functionality foundation to convert into the Next.js PWA.
- The PHP source repository may be inspected and copied from, but the current live PHP website, hosting, DNS, and production deployment must NOT be changed or cut over during this build phase.
- The older application work is a reference/reuse source for authentication, member/staff roles, dashboards, profiles, admin tools, and other application functionality.
- Final product: ONE cohesive Liberty Church PWA with the public church website at the front and authenticated member/staff experiences behind Login.
- Preserve the top-level public `Login` entry.
- Preserve Youth as an intentional standalone visual/CSS exception and test it separately after shared styling changes.
- Approved test Supabase project: `ywfvbgblyuqwofejmasv`. Do not substitute another project.
- Reuse existing approved keys/configuration privately. Never print or commit secret/service-role credentials.
- Do not deploy to or modify the live PHP site until the user explicitly authorizes final cutover.

# Liberty Church Astra PWA Working System

Astra must treat these documents as the project control system:

1. `00_MASTER_DIRECTIVE.md` — permanent project vision, requirements, stages, and strict rules.
2. `01_IMPLEMENTATION_WORKBOOK.md` — living implementation and verification record.
3. `02_QA_MASTER_CHECKLIST.md` — mandatory QA gate.
4. `PLANNED_WORK.md` — current execution queue.
5. `COMPLETED_WORK.md` — completed implementation log.

When an older `Current user direction` block conflicts with this file or a newer explicit user instruction, the newest direction wins.

## Mandatory Work Loop

INSPECT
→ DOCUMENT
→ PLAN
→ CHECK AGAINST MASTER DIRECTIVE
→ IMPLEMENT
→ PUSH TO PREVIEW REPO
→ BUILD / RUN
→ TEST
→ VISUALLY INSPECT
→ CHECK QA MASTER CHECKLIST
→ FIX
→ RETEST
→ UPDATE WORKBOOK / LOGS
→ ADVANCE

The current PHP website is the public foundation of the PWA.
The previous app work is the authenticated/role foundation and reference.
The working Next.js repository is where the unified product is built and preview-deployed.
