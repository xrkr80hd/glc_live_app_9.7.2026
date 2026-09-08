## Deployment configuration repair — 2026-09-08

- User confirmed the service-role key was added to Vercel Production and Preview and redeployed; its value has not been read or committed.
- Confirmed the corrected Vercel project ID and that deployment eb292b5 uses this app repository main. Live PHP site remains outside this deployment.
- Reproduced deployed login HTTP 500: Member sign-in is not configured yet.
- Added .env.production with only the approved test Supabase URL and user-supplied publishable key. User explicitly authorized committing the publishable key. Next.js production builds, including Vercel Preview builds, load this file; dashboard values retain precedence.
- Narrow .gitignore exception permits only this reviewed production-default file. All .env.local files and secret-bearing variants remain ignored. Never add a service-role or YouTube key to the tracked file.
- No auth guard, role policy, database schema, application layout or Youth styles changed.
- Verification before push: file contains exactly the two public variables; no secret variables. Deployed build and login endpoint verification pending.

## Connected Supabase checkpoint — 2026-09-07

- The user authorized Git pushes as the ongoing change-tracking/deployment workflow. Live PHP site cutover remains outside this task.
- Configured the approved project URL and supplied publishable key in ignored .env.local. Publishable credentials do not grant database administration. No service-role key is configured locally.
- Direct REST verification: published announcements returned HTTP 200 with two rows. The exact announcement columns used by the app also returned 200 with two rows. Published ministries returned 200 with three rows (query limited to three). No returned record content or key is recorded here.
- The social_links query returned HTTP 404 / PGRST205: the relation was not found in the API schema cache. Existing social-links migrations are present in the repository; schema existence, exposure and migration state still require privileged inspection before applying changes.
- Configured local homepage returned 200. Login page returned 200. An empty POST to /api/member-auth/login returned 500 with 'Member sign-in is not configured yet.' Source confirms isMemberAuthConfigured requires a server-side service key for profile lookup/provisioning. Successful login is NOT verified.
- Supabase management connector currently reports Unknown tool. The supplied publishable key permits tested public reads but cannot replace management credentials or run migrations.
- The designated Vercel project still returns 404 for the connected team. There is no .github deployment workflow in this checkout. External Vercel/Supabase integrations may exist but have not been verified; a Git push is not evidence that migrations ran.
- No database records, application code, CSS, or migration files changed in this checkpoint. Existing app fallbacks have not been removed. Visual/mobile/installed-PWA QA remains outstanding.
- Stage gate: HOLD. Next: make the approved test project's server-side service credential available through private environment configuration and restore management access; inspect migration state and API exposure; then test member login and real-content rendering. Do not paste a secret into chat or commit it to Git.

## Baseline runtime checkpoint — 2026-09-07

- Verified the uploaded app and repository source files are identical at initial commit 671a28f.
- Restored the four user-provided project control documents with the latest app-only direction taking precedence over historical site-merge instructions.
- Production build: PASS (`ADMIN_ONLY_MODE=false NEXT_DIST_DIR=.next-baseline-build npm run build`, exit 0). All 50 static pages generated. A webpack cache-performance warning is non-blocking.
- Local HTTP checks: homepage, Youth, member login and manifest returned 200.
- Logged-out member route returned 307 to /member-access. Logged-out admin returned 307 to /admin/login. Admin session API returned 401.
- These checks used no active Supabase environment file. They demonstrate rendering and logged-out guards, not real content loading or successful login. Existing content fallbacks remain unchanged.
- Visual/mobile/installed-PWA QA: NOT TESTED. agent-browser is unavailable in this runtime (command not found).
- Supabase project ywfvbgblyuqwofejmasv still returns permission denied after the user resumed it. No database mutation attempted.
- Vercel project prj_Mfe4wogitvlctngsjHX2Gemxj5iZ remains unverified; last connector check returned 404 under the connected team.
- Application source, styles, routes and database schema remain unchanged. Git exclusions now protect all .env variants except the template, dependency directories and test build output.
- Stage gate: HOLD for database-backed authentication/content checks and visual/mobile/PWA review.
- Next action: obtain connector access to the designated test project, inspect its existing schema, configure the app privately, then repeat functional and visual QA. Preserve the existing YouTube key without committing it.

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

# LIBERTY CHURCH PWA — IMPLEMENTATION WORKBOOK

Astra must maintain this document throughout the project.

Do not rely on memory alone.

---

# CURRENT PROJECT STATUS

Stage: 0 — Project baseline

Status: Source inventory recorded; runtime verification outstanding. HOLD; no stage advancement claimed.

Date: 2026-09-07

Primary Objective: Preserve the live site's public foundation and the app's reusable account/role functionality for one unified PWA.

Current Blocker: Baseline build and local HTTP checks pass. Supabase access is denied for the approved project; visual/mobile/PWA verification remains outstanding. See the latest runtime checkpoint.

Next Action: Prepare the existing app for baseline runtime checks using already available project configuration; do not request the existing YouTube key again. Run public and admin views separately, then record build and relevant QA evidence before advancing.

---

# BUILD HEALTH

## Public Site
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Authentication
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Member Experience
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Profiles
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Roles
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Multi-Role
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## PWA
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Youth Page
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Worship Workflow
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## Media Workflow
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

## FOH Workflow
[ ] Working
[ ] Partial
[ ] Broken
[x] Not Tested

---

# STAGE RECORD TEMPLATE

Use this structure for EACH stage.

## STAGE:

### OBJECTIVE

### INSPECTED

List actual:

- files
- routes
- components
- database tables
- functions
- APIs
- environment variables
- external services

### FOUND

### VERIFIED WORKING

Only list items actually tested.

### PARTIAL

### BROKEN

### UI ONLY

### KEEP

### CHANGE

### REMOVE

Only remove proven obsolete work and explain why.

### RISKS

Consider:

- production
- routing
- URLs
- auth
- database
- permissions
- PWA
- Youth CSS
- public content
- existing functionality

### IMPLEMENTATION PLAN

### EXPECTED FILES TO CHANGE

### DATABASE CHANGES

### AUTH CHANGES

### IMPLEMENTED

### ACTUAL FILES CHANGED

### TESTS PERFORMED

### VISUAL QA

Desktop:
[ ] Pass
[ ] Fail
[ ] N/A

Mobile:
[ ] Pass
[ ] Fail
[ ] N/A

Installed PWA:
[ ] Pass
[ ] Fail
[ ] N/A

Youth Page:
[ ] Pass
[ ] Fail
[ ] N/A

### FUNCTIONAL QA
[ ] Pass
[ ] Fail

Details:

### PERMISSION QA
[ ] Pass
[ ] Fail
[ ] N/A

Details:

### REGRESSION QA

Areas retested:

### QA CHECKLIST REVIEWED

[ ] Yes

Reference:
`02_QA_MASTER_CHECKLIST.md`

### FAILURES FOUND

### FIXES APPLIED

### RETEST RESULTS
[ ] Pass
[ ] Fail

### EXPERIENCE REVIEW

Does this look like a polished Liberty Church product?

Does it feel good in a browser?

Does it feel good as an installed PWA?

Is navigation obvious?

Does anything appear unfinished?

Does anything feel visually awkward?

### STAGE GATE

[ ] PASS — Safe to advance

[ ] HOLD — Fix before advancing

### NEXT ACTION

---

# ARCHITECTURAL DECISION LOG

## DECISION:

Date:

Problem:

Options Considered:

Chosen Approach:

Reason:

Risks:

Future Impact:

---

# CURRENT ROUTE MAP

## PUBLIC

Route:
Purpose:
Status:
Source:

## AUTHENTICATED

Route:
Purpose:
Required Access:
Status:
Source:

---

# ROLE MATRIX

| Role | Workspace | Main Purpose | Status |
|---|---|---|---|
| church_member | Member | Base member experience | Base member access exists without requiring this canonical role key; untested. |
| master_admin | Administration | System administration | Existing system uses superuser/is_superuser; mapping required. |
| media_team | Media | Media/service workflow | Role dashboard exists; service tools partial/UI only. |
| worship_team | Worship | Worship assignments | Role dashboard exists; several actions lack destinations. |
| worship_leader | Worship Leadership | Service/worship planning | Existing role; song-list admin foundation exists; shared vocalist workflow unverified. |
| foh_sound | FOH | Audio/service information | Role dashboard exists; shared service integration incomplete. |
| pastor | Pastoral | Pastoral functions | Existing role; review technical-admin upgrade permissions. |
| youth_minister | Youth | Youth leadership | Existing role and youth tools. |
| youth_minister_assistant | Youth | Youth assistance | Existing role; assistant dashboard exists; consolidate workspace later. |
| childrens_church | Preschool | Ministry workspace | Currently aliased to kids_church; conflicts with distinct preschool requirement. |
| kids_church | Elementary | Ministry workspace | Existing role; official ministry naming needs site audit. |
| lay_staff | Lay Staff | Assigned responsibilities | Not established by baseline review. |
| mens_ministry_leader | Men's Ministry | Ministry leadership | Not established by baseline review. |
| womens_ministry_leader | Women's Ministry | Ministry leadership | Not established by baseline review. |

---

# SERVICE WORKFLOW STATUS

Service object:
[ ] Yes
[ ] No

Worship Leader can assign songs:
[ ] Yes
[ ] No

Song leader can be assigned:
[ ] Yes
[ ] No

Worship Team can see plan:
[ ] Yes
[ ] No

Media Team can see song/order/leader:
[ ] Yes
[ ] No

FOH can see song/order/leader:
[ ] Yes
[ ] No

Livestream mix can identify lead vocalist:
[ ] Yes
[ ] No

Presentation operator can identify song order:
[ ] Yes
[ ] No

---

# MEDIA CHECKLIST STATUS

Master Admin can manage stations:
[ ] Yes
[ ] No

Configured current stations:

[ ] Projector Slides
[ ] YouTube / Livestream Mix
[ ] Livestream Slides

Media member can select station:
[ ] Yes
[ ] No

Correct checklist loads:
[ ] Yes
[ ] No

Checklist can be completed:
[ ] Yes
[ ] No

Completion persists:
[ ] Yes
[ ] No

Completion can record user:
[ ] Yes
[ ] No

Completion can record timestamp:
[ ] Yes
[ ] No

---

# KNOWN ISSUES

## Critical

1. Permission verification required before release: role-assignment POST uses requireAdminSession, whose helper checks session presence, without a master-admin-specific check in that route. lib/admin-auth.js can upgrade a member session through role-admin assignments, allowlisted roles, or a legacy password record. This combination requires authorized/unauthorized tests; no live exploit or data change was attempted.

## High

1. Public ChurchHeader displays Member Access, not Login, and hides that action in the mobile drawer. This conflicts with the always-visible top Login requirement.
2. Youth styling is visually specialized but not physically isolated: shared CSS files contain youth selectors and the public Youth page adds inline rules. Preserve the distinct design and plan safe stylesheet isolation; do not globally normalize it.
3. Role naming/identity needs reconciliation: superuser vs master_admin, implicit member vs church_member, and childrens_church aliased to kids_church.
4. Runtime/auth/data/PWA installation remain untested; source presence is not working-functionality evidence.

## Medium

1. Several ministry action cards have no href and render as noninteractive spans; service readiness, stations and chat are not established working features.
2. PWA manifest still names the product Liberty Church Member Beta and starts at /member. Review against unified public launch intent at architecture stage.
3. Content fallbacks include example youth albums; real database loading must be distinguished from fallback rendering.
4. Prior PLANNED_WORK.md includes items later described as completed in COMPLETED_WORK.md. Treat logs as historical evidence, not current test results.

## Low

1. Multiple public header/footer implementations and legacy public assets need a usage/parity review before any removal. No files have been proven safe to delete.

---

# DEFERRED FEATURES

Examples:

- full church chat
- direct messages
- livestream reactions
- advanced notifications

Do not confuse DEFERRED with BROKEN.

---

# NEXT THREE PRIORITIES

1. Finish Stage 0 runtime/configuration evidence and record applicable QA; preserve the existing YouTube key.

2. Once the baseline gate permits, audit live-site public pages, Login and Youth separately (Stage 1).

3. Audit existing authenticated functionality and permissions (Stage 2), then prepare the merge map before implementation.

Do not start Priority 2 before Priority 1 is sufficiently verified unless there is a documented dependency reason.


# STAGE 0 — SOURCE INSPECTION RECORD

## Objective and scope

Inspect both supplied ZIP snapshots and document their foundations, gaps and dependencies without modifying application code. The user's new Master Directive governs over older conflicting repository workflow instructions. The first build milestone remains the live website's public PWA conversion; historical youth-admin cleanup does not override that direction.

## Findings and classification

| Capability | Evidence | Baseline classification |
|---|---|---|
| Public foundation | Site root HTML pages, assets/style.css, assets/js, PHP API/admin directories | KEEP source; functionality not runtime-tested |
| App framework | package.json plus package-lock.json | Next.js 15.5.12, React 19.2.4 resolved; npm lockfile |
| Supabase client | Lockfile and lib/supabase | SSR 0.9.0; supabase-js 2.98.0; actual database deployment unverified |
| Accounts/profiles | lib/member-auth.js; member-auth API routes; member/profile pages | REUSABLE/PARTIAL; Supabase Auth linked to team_members.auth_user_id |
| Admin authentication | lib/admin-auth.js; admin login routes | Separate signed admin-session path and member upgrade bridge; audit before unification |
| Protected member pages | app/member/layout.jsx | Server session check and redirect present; unauthorized runtime test outstanding |
| Multi-role foundation | team_member_roles join table with unique member_id/role_id pair; getMemberRoles | REUSABLE; supports multiple assignments in schema/source, not yet runtime-proven |
| Role navigation | lib/role-dashboard-config.js; RoleDashboardRoute; AdminConsoleShell | Access-based dashboard filtering exists; do not rebuild blindly |
| Worship/service planning | /api/admin/service-song-lists and item route | PARTIAL admin CRUD; songs_json plus date/title/notes/role_id; no confirmed end-to-end song-leader assignment |
| Media stations/readiness | Targeted source search for station/checklist | No operational station/checklist persistence found; one Preview Checklist UI text hit |
| Messages/files | Source route/table inventory | Media uploads/albums exist; generic role-scoped file archive and conversation system not established |
| Public Youth | Site youth.html; app/youth/page.jsx; body.youth styles | KEEP distinctive design; CSS isolation work must be planned carefully |
| Member Youth | app/member/youth/page.jsx and children | Separate member presentation, shared youth content loader; runtime untested |
| Livestream/sermons | Site scripts/PHP endpoints; lib/youtube.js; lib/content.js; /api/live-status | Existing integration foundation; actual playback/key restrictions untested |
| PWA | app/manifest.js; layout metadata; installed icon files | PARTIAL; manifest/icons present, install/session/navigation untested |
| Offline behavior | Source scan | No sw.js/service-worker file found; not proof of install failure; offline behavior unverified |
| Deployment | User's confirmed Git/SSH deployment workflow | Accepted context; no push, tunnel probe, deployment or host changes performed |

## YouTube key continuity — strict

The existing key literal is present in the uploaded live site's sermons.html. Its value was not printed and is not included in these documents. Reuse it at implementation time; do not ask Trav to retrieve, recreate or reupload it. The app references YOUTUBE_SERMONS_API_KEY and YOUTUBE_LIVE_API_KEY with compatibility aliases in lib/content.js. The live site's sermon lookup runs in browser code, while app/lib/youtube.js fetches server-side. Check compatibility with the existing restrictions before wiring; do not change restrictions or assume the same key is authorized for every context. No external key request was made and no transfer occurred during this source-only stage.

## Backend and data

The live site uses PHP/PDO MySQL and includes a database SQL export. The app uses Supabase/Postgres with migrations, root schema extensions, client/server/admin helpers and content fallback paths. These are different data foundations; a future merge must preserve real public content and account/role relationships. No SQL export rows or personal data were reproduced in this report. No migration was applied.

Core app relationships: Supabase Auth user -> team_members.auth_user_id -> team_member_roles -> team_roles. Existing is_superuser and role aliases require a documented canonical-role mapping, not destructive renaming. Existing songs_json is a reusable starting point; the shared Service object, assigned lead vocalist, instrument assignments and configurable media stations still require detailed design/verification.

## Dependencies and runtime limitations

The uploaded app has .env.example only; its populated-looking example values do not establish real configuration. It has no node_modules. Supabase URL/public key/service-role configuration, session secret, public/auth URL routing, media bucket and YouTube configuration are required by relevant code. Optional reset-email settings and local bypass switches also exist. The older AGENTS.md points to a Mac-specific path unavailable in this workspace; the inspected uploaded app root is the current source snapshot, not a claimed deployment checkout. Public/admin dev-server instructions specify ports 3001/3000 with separate Next build directories. No server was started in this stage.

## Duplicates, dead code and risk

Several Site/Church header/footer components coexist, alongside public assets/site.js and legacy CSS. A dependency and visual parity pass must precede removal. No dead code is conclusively classified for deletion. App/lib/content.js contains fallback/example content that can mask missing real data; runtime checks must inspect network/data provenance. Prior completed-work claims of successful builds are historical only.

## Verified working

No product behavior is certified working by this source-only inspection. Verified evidence: both archives are readable; route/manifest/schema/config code exists at recorded paths; required manifest icons exist. Runtime, external services, key validity, persistence, auth, permissions and visual quality remain untested.

## Implemented / changed

Only this working-system package's workbook was updated. Application and website source files, original source ZIPs, database, credentials, keys and deployments were not changed. The master directive, README and QA checklist contents are preserved byte-for-byte.

## Tests and QA

- Source inventory: completed for route/file/schema/environment-name baselines.
- Relevant source review: public navigation, Youth CSS loading, member/profile/role auth helpers, dashboard rendering, service-song-list APIs, manifest/icons, YouTube configuration.
- Desktop/mobile/installed PWA visual QA: NOT TESTED.
- Functional and permission QA: NOT TESTED.
- Production build: NOT RUN.
- QA checklist reviewed: Yes; sections A, B, F, G, H, J, L–R, T, W and Y guide the outstanding checks.
- No runtime failures were fixed, and no runtime pass is claimed.

## Stage gate

HOLD — source inventory is recorded; runtime/build and applicable QA evidence remain outstanding. Do not mark a product stage PASS or proceed into implementation based on source presence. Missing/deferred future features are not automatically runtime defects. Next work remains baseline configuration/runtime verification, then the staged public audit.

## Architectural decisions

1. 2026-09-07: Adopt the supplied working-system documents; retain existing code and historical logs as evidence. Reason: user's explicit direction establishes one unified PWA and public-first milestone.
2. 2026-09-07: Preserve Youth as a distinct design scope even though the current snapshots physically share CSS. Reason: strict user requirement and regression risk.
3. 2026-09-07: Preserve existing restricted YouTube key; record only its source location. Reason: prevent repeated credential setup and avoid key disclosure.


# COMPLETE SOURCE ROUTE INVENTORY

All routes below are source-present and runtime NOT TESTED. Bracket segments are dynamic. Access labels indicate intended source area, not verified authorization.

## Live site pages

- /beliefs.html
- /give.html
- /index.html
- /live.html
- /live2.html
- /prayer.html
- /sermons.html
- /visit.html
- /youth.html

## Live site PHP endpoints

- /admin/index.php
- /api/announcements-main/index.php
- /api/current-stream/index.php
- /api/ministries/index.php
- /api/prayer-request/index.php
- /api/stream-status/index.php
- /api/visit/index.php
- /api/youth/index.php
- /includes/announcements_main.php
- /includes/announcements_youth.php
- /includes/footer.php
- /includes/header.php
- /includes/mail.php
- /includes/scripture_of_the_week.php
- /php/admin/announcements/delete.php
- /php/admin/announcements/edit.php
- /php/admin/announcements/index.php
- /php/admin/announcements/new.php
- /php/admin/announcements/ordering.php
- /php/admin/announcements/reorder.php
- /php/admin/announcements/upload.php
- /php/admin/bootstrap.php
- /php/admin/dashboard.php
- /php/admin/layout.php
- /php/admin/login.php
- /php/admin/logout.php
- /php/admin/ministries/delete.php
- /php/admin/ministries/edit.php
- /php/admin/ministries/index.php
- /php/admin/ministries/new.php
- /php/admin/ministries/reorder.php
- /php/admin/prayers/delete.php
- /php/admin/prayers/index.php
- /php/admin/prayers/mark.php
- /php/admin/stream/index.php
- /php/admin/users/edit.php
- /php/admin/users/index.php
- /php/admin/users/new.php
- /php/admin/users/toggle.php
- /php/admin/visits/delete.php
- /php/admin/visits/index.php
- /php/admin/visits/mark.php
- /php/admin/youth-albums/delete.php
- /php/admin/youth-albums/edit.php
- /php/admin/youth-albums/index.php
- /php/admin/youth-albums/manage-media.php
- /php/admin/youth-albums/new.php
- /php/admin/youth-banners/delete.php
- /php/admin/youth-banners/edit.php
- /php/admin/youth-banners/index.php
- /php/admin/youth-banners/new.php
- /php/admin/youth-scripture/index.php
- /php/api/_bootstrap.php
- /php/api/announcements_main.php
- /php/api/current_stream.php
- /php/api/ministries.php
- /php/api/prayer_request.php
- /php/api/visit.php
- /php/api/youth.php
- /php/config.php

## Next.js pages and API handlers

| Route | Area | Source |
|---|---|---|
| /admin/forgot-password | Authenticated | app/admin/forgot-password/page.jsx |
| /admin/login | Authenticated | app/admin/login/page.jsx |
| /admin | Authenticated | app/admin/page.jsx |
| /admin/prayer-approval | Authenticated | app/admin/prayer-approval/page.jsx |
| /admin/reset-password | Authenticated | app/admin/reset-password/page.jsx |
| /admin/test-feedback | Authenticated | app/admin/test-feedback/page.jsx |
| /api/admin/album-photos/[id] | API | app/api/admin/album-photos/[id]/route.js |
| /api/admin/album-photos | API | app/api/admin/album-photos/route.js |
| /api/admin/announcements/[id] | API | app/api/admin/announcements/[id]/route.js |
| /api/admin/announcements | API | app/api/admin/announcements/route.js |
| /api/admin/archived-sermons/[id] | API | app/api/admin/archived-sermons/[id]/route.js |
| /api/admin/archived-sermons | API | app/api/admin/archived-sermons/route.js |
| /api/admin/auth/request-password-reset | API | app/api/admin/auth/request-password-reset/route.js |
| /api/admin/auth/reset-password | API | app/api/admin/auth/reset-password/route.js |
| /api/admin/bookkeeping-reports/[id] | API | app/api/admin/bookkeeping-reports/[id]/route.js |
| /api/admin/bookkeeping-reports | API | app/api/admin/bookkeeping-reports/route.js |
| /api/admin/gallery-videos/[id] | API | app/api/admin/gallery-videos/[id]/route.js |
| /api/admin/gallery-videos | API | app/api/admin/gallery-videos/route.js |
| /api/admin/livestreams/[id] | API | app/api/admin/livestreams/[id]/route.js |
| /api/admin/livestreams | API | app/api/admin/livestreams/route.js |
| /api/admin/login/member | API | app/api/admin/login/member/route.js |
| /api/admin/login | API | app/api/admin/login/route.js |
| /api/admin/logout | API | app/api/admin/logout/route.js |
| /api/admin/me | API | app/api/admin/me/route.js |
| /api/admin/ministries/[id] | API | app/api/admin/ministries/[id]/route.js |
| /api/admin/ministries | API | app/api/admin/ministries/route.js |
| /api/admin/ministry-order-requests/[id] | API | app/api/admin/ministry-order-requests/[id]/route.js |
| /api/admin/ministry-order-requests | API | app/api/admin/ministry-order-requests/route.js |
| /api/admin/photo-albums/[id] | API | app/api/admin/photo-albums/[id]/route.js |
| /api/admin/photo-albums | API | app/api/admin/photo-albums/route.js |
| /api/admin/prayer-requests/[id] | API | app/api/admin/prayer-requests/[id]/route.js |
| /api/admin/prayer-requests | API | app/api/admin/prayer-requests/route.js |
| /api/admin/scriptures/[id] | API | app/api/admin/scriptures/[id]/route.js |
| /api/admin/scriptures | API | app/api/admin/scriptures/route.js |
| /api/admin/seasonal-features/[id] | API | app/api/admin/seasonal-features/[id]/route.js |
| /api/admin/seasonal-features | API | app/api/admin/seasonal-features/route.js |
| /api/admin/sermons/[id] | API | app/api/admin/sermons/[id]/route.js |
| /api/admin/sermons | API | app/api/admin/sermons/route.js |
| /api/admin/service-song-lists/[id] | API | app/api/admin/service-song-lists/[id]/route.js |
| /api/admin/service-song-lists | API | app/api/admin/service-song-lists/route.js |
| /api/admin/social-links/[id] | API | app/api/admin/social-links/[id]/route.js |
| /api/admin/social-links | API | app/api/admin/social-links/route.js |
| /api/admin/team-member-roles/[id] | API | app/api/admin/team-member-roles/[id]/route.js |
| /api/admin/team-member-roles | API | app/api/admin/team-member-roles/route.js |
| /api/admin/team-members/[id] | API | app/api/admin/team-members/[id]/route.js |
| /api/admin/team-members | API | app/api/admin/team-members/route.js |
| /api/admin/team-roles/[id] | API | app/api/admin/team-roles/[id]/route.js |
| /api/admin/team-roles | API | app/api/admin/team-roles/route.js |
| /api/admin/uploads | API | app/api/admin/uploads/route.js |
| /api/admin/visit-requests/[id] | API | app/api/admin/visit-requests/[id]/route.js |
| /api/admin/visit-requests | API | app/api/admin/visit-requests/route.js |
| /api/admin/youth-banners/[id] | API | app/api/admin/youth-banners/[id]/route.js |
| /api/admin/youth-banners | API | app/api/admin/youth-banners/route.js |
| /api/live-status | API | app/api/live-status/route.js |
| /api/member-auth/email-change | API | app/api/member-auth/email-change/route.js |
| /api/member-auth/login | API | app/api/member-auth/login/route.js |
| /api/member-auth/logout | API | app/api/member-auth/logout/route.js |
| /api/member-auth/password | API | app/api/member-auth/password/route.js |
| /api/member-auth/profile | API | app/api/member-auth/profile/route.js |
| /api/member-auth/profile-photo | API | app/api/member-auth/profile-photo/route.js |
| /api/member-auth/request-password-reset | API | app/api/member-auth/request-password-reset/route.js |
| /api/member-auth/reset-password | API | app/api/member-auth/reset-password/route.js |
| /api/member-auth/signup | API | app/api/member-auth/signup/route.js |
| /api/member-feedback | API | app/api/member-feedback/route.js |
| /api/prayer | API | app/api/prayer/route.js |
| /api/prayer-request | API | app/api/prayer-request/route.js |
| /api/visit | API | app/api/visit/route.js |
| /auth/confirm | Public / auth entry | app/auth/confirm/route.js |
| /beliefs | Public / auth entry | app/beliefs/page.jsx |
| /dashboard/[dashboard] | Authenticated | app/dashboard/[dashboard]/page.jsx |
| /dashboard | Authenticated | app/dashboard/page.jsx |
| /dashboard/role-access | Authenticated | app/dashboard/role-access/page.jsx |
| /dashboard/youth/assistant | Authenticated | app/dashboard/youth/assistant/page.jsx |
| /dashboard/youth/preview | Authenticated | app/dashboard/youth/preview/page.jsx |
| /dashboard/youth/run-of-show | Authenticated | app/dashboard/youth/run-of-show/page.jsx |
| /dashboard/youth/theme | Authenticated | app/dashboard/youth/theme/page.jsx |
| /give | Public / auth entry | app/give/page.jsx |
| /live | Public / auth entry | app/live/page.jsx |
| /member/announcements/[id] | Authenticated | app/member/announcements/[id]/page.jsx |
| /member/announcements | Authenticated | app/member/announcements/page.jsx |
| /member/beliefs | Authenticated | app/member/beliefs/page.jsx |
| /member/directory | Authenticated | app/member/directory/page.jsx |
| /member/feedback | Authenticated | app/member/feedback/page.jsx |
| /member/give | Authenticated | app/member/give/page.jsx |
| /member/live | Authenticated | app/member/live/page.jsx |
| /member/more | Authenticated | app/member/more/page.jsx |
| /member | Authenticated | app/member/page.jsx |
| /member/prayer | Authenticated | app/member/prayer/page.jsx |
| /member/prayer/wall | Authenticated | app/member/prayer/wall/page.jsx |
| /member/profile/change-email | Authenticated | app/member/profile/change-email/page.jsx |
| /member/profile/change-password | Authenticated | app/member/profile/change-password/page.jsx |
| /member/profile/edit | Authenticated | app/member/profile/edit/page.jsx |
| /member/profile | Authenticated | app/member/profile/page.jsx |
| /member/profile/photo | Authenticated | app/member/profile/photo/page.jsx |
| /member/sermons | Authenticated | app/member/sermons/page.jsx |
| /member/settings/announcement-notifications | Authenticated | app/member/settings/announcement-notifications/page.jsx |
| /member/settings | Authenticated | app/member/settings/page.jsx |
| /member/settings/preferences | Authenticated | app/member/settings/preferences/page.jsx |
| /member/youth/announcements/[id] | Authenticated | app/member/youth/announcements/[id]/page.jsx |
| /member/youth/announcements | Authenticated | app/member/youth/announcements/page.jsx |
| /member/youth/devotional | Authenticated | app/member/youth/devotional/page.jsx |
| /member/youth/event/[id] | Authenticated | app/member/youth/event/[id]/page.jsx |
| /member/youth/event | Authenticated | app/member/youth/event/page.jsx |
| /member/youth | Authenticated | app/member/youth/page.jsx |
| /member-access/forgot-password | Public / auth entry | app/member-access/forgot-password/page.jsx |
| /member-access | Public / auth entry | app/member-access/page.jsx |
| /member-access/reset-password | Public / auth entry | app/member-access/reset-password/page.jsx |
| / | Public / auth entry | app/page.jsx |
| /prayer | Public / auth entry | app/prayer/page.jsx |
| /sermons | Public / auth entry | app/sermons/page.jsx |
| /visit | Public / auth entry | app/visit/page.jsx |
| /youth/media/[id] | Public / auth entry | app/youth/media/[id]/page.jsx |
| /youth/media | Public / auth entry | app/youth/media/page.jsx |
| /youth | Public / auth entry | app/youth/page.jsx |

## SQL sources

- ARCHIVED_SERMONS_SCHEMA.sql
- SUPABASE_SCHEMA_HOME_EXTENSIONS.sql
- supabase/migrations/202603090001_initial_schema.sql
- supabase/migrations/202603090002_archived_sermons.sql
- supabase/migrations/202603090003_sermons_preached_on_compat.sql
- supabase/migrations/202603090004_schema_hardening_compat.sql
- supabase/migrations/202603100001_highlight_card_playlist_controls.sql
- supabase/migrations/202603160001_member_feedback.sql
- supabase/migrations/202603160002_member_accounts.sql
- supabase/migrations/202603160003_member_auth_supabase.sql
- supabase/migrations/202603170001_member_feedback_hardening.sql
- supabase/migrations/202603180001_seed_canonical_team_roles.sql
- supabase/migrations/202603180002_rls_policy_tightening.sql
- supabase/migrations/202603180003_rls_policy_linter_lockdown.sql
- supabase/migrations/202603180004_member_auth_lock_controls.sql
- supabase/migrations/202603180005_social_links.sql
- supabase/migrations/202603190001_team_roles_schema.sql
- supabase/migrations/202604210001_add_scripture_devotional_fields.sql
- supabase/migrations/202604210001_announcement_images.sql
- supabase/migrations/202604210002_photo_upload_schema.sql
- supabase/migrations/202604210003_ministry_images.sql
- supabase/migrations/202604220001_social_links_compat.sql

## Environment names referenced directly by app source

Names only; values intentionally omitted. This inventory also includes optional/bypass settings and is not a recommendation to enable them. Compatibility lookup strings may add aliases.

ADMIN_BYPASS_LOGIN, ADMIN_BYPASS_USERNAME, ADMIN_DEBUG_RESET_LINKS, ADMIN_MAIL_FROM, ADMIN_MEMBER_UPGRADE_ROLE_KEYS, ADMIN_ONLY_MODE, ADMIN_PASSWORD, ADMIN_PASSWORD_ITERATIONS, ADMIN_RESET_TOKEN_TTL_MINUTES, ADMIN_RESET_URL_BASE, ADMIN_SESSION_SECRET, ADMIN_SESSION_TTL_DAYS, ADMIN_UPLOAD_MAX_BYTES, ADMIN_USERNAME, APP_URL, BOOKKEEPER_ORDER_VISIBILITY, DEMO_MEMBER_EMAIL_DOMAIN, DEMO_MEMBER_LOGIN_STYLE, DEMO_MEMBER_PASSWORD, DEMO_MEMBER_SHORT_PREFIX, EDGE_PATH, LIVE_STATUS_CACHE_MS, LOCAL_MEMBER_ACCESS_BYPASS, NEXT_DIST_DIR, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_FALLBACK_STREAM_VIDEO_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, NODE_ENV, RESEND_API_KEY, SCREENSHOT_BASE_URL, SITE_URL, SUPABASE_MEDIA_BUCKET, SUPABASE_PUBLIC_SERVICE_KEY, SUPABASE_SERVICE_KEY, SUPABASE_SERVICE_ROLE, SUPABASE_SERVICE_ROLE_KEY, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL
