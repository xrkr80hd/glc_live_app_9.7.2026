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

# Completed Work

## Workflow

- Log completed work here after finishing a task.
- Before closing a task, re-check `PLANNED_WORK.md` and make sure anything missed is either completed or still explicitly queued.

## Completed Items

- Fixed the public-shell footer data path so the main public pages now receive admin-managed social links instead of relying on footer fallbacks.
- Moved the media resources into the `Youth Page` accordion in admin and removed the sidebar group-count number from the drawer.
- Added a public youth-media route pair:
  - `/youth/media`
  - `/youth/media/[id]`
- Added a youth-media entry point on the public `Youth` page below announcements so media is reachable from the youth page without adding it to the top nav.
- Built successfully after the social-link footer fix, admin youth/media regrouping, and new public youth-media pages.
- Removed all other `.md` files from the repo tree so only `AGENTS.md`, `PLANNED_WORK.md`, and `COMPLETED_WORK.md` remain.
- Confirmed the repo-visible work-log flow is now `AGENTS.md` -> `PLANNED_WORK.md` -> `COMPLETED_WORK.md`.
- Updated `AGENTS.md` so future work does not rely on extra markdown handoff/planning files.
- Refreshed `PLANNED_WORK.md` to hold the active queue instead of stale root markdown docs.
- Started the side-by-side local dev servers again per repo guardrail:
  - admin/CMS: `http://localhost:3000/admin`
  - website/public: `http://localhost:3001`
- Created the repo-visible root work log files `PLANNED_WORK.md` and `COMPLETED_WORK.md` so workspace agents can read the plan and completed history directly.
- Restored the admin runtime on `localhost:3000` after fetch failures caused by the admin server not running.
- Finished the scripture admin change so `Scripture OTW` is youth-only in the admin flow.
- Added a repo-level workflow guardrail in `AGENTS.md` tying LICL to `PLANNED_WORK.md` and `COMPLETED_WORK.md`.
- Renamed scripture admin labels from `Top Line` to `Title` and from `Reference` to `Scripture`.
- Updated create-button wording so the relevant actions use `Post Devotional`, `Post Announcement`, and `Post Ministry`.
- Added legacy-schema fallback in the scripture admin API so fetch/create/update no longer hard-fail when the `title` and `devotional_text` columns are missing from the database.
- Verified the youth ticker admin API returns successfully again from `/api/admin/youth-banners`.
- Logged work state into session memory.
- Created the separate session log files `/memories/session/planned_work.md` and `/memories/session/completed_work.md`.
- Updated persistent working-style memory so LICL now explicitly means: inspect local context, read planned work, implement the current plan, re-check for missed items, then log finished work in completed work.
- Verified the current admin config for `photo-albums`, `album-photos`, and `gallery-videos` does not expose a `Published` checkbox in `components/admin/AdminDashboard.jsx`.
- Replaced the one-off youth CTA styling with a shared `youth` button variant so the public `Youth` page and youth media pages use the same youth-theme button language instead of the site-green button.
- Simplified the public `Youth` page media entry section so it no longer uses the oversized promo card/copy block and now keeps the call to action compact.
- Tightened the public youth media album cards for phones by capping the mobile card width, reducing the mobile image footprint, and scaling down the album title/button spacing.
- Compacted the shared site footer on mobile by reducing top/bottom padding and changing the top section into a tighter mobile grid so it stops making pages excessively long on phones.
- Built successfully after the youth button, youth media mobile-card, and mobile footer changes.
- Re-read the repo work log under LICL and added the livestream-tab cleanup to `PLANNED_WORK.md` so the live embed-link flow and fallback-video replacement flow stay explicitly queued.
- Added a new repo workflow guardrail to `AGENTS.md` and `PLANNED_WORK.md`: if the user does not explicitly say `STOP`, add the new issue to the TODO queue and keep working through the current operation.
- Suppressed `is_active` and `is_published` from the admin renderer so those Active/Published checkboxes no longer appear in create forms, edit forms, or preview blocks across the admin UI.
- Matched the posted ministries/service-times accordion to the same accordion treatment as the create row above it and removed the extra `Open` text from the toggle behavior.
- Matched the posted announcements accordion to the same accordion treatment and chevron-only toggle pattern.
- Built successfully after the latest admin checkbox suppression and accordion cleanup.
- Added an idempotent social-links compatibility migration so `public.social_links` can be created or repaired in databases that missed the original migration.
- Restyled the fallback-video upload accordion so it matches the rest of the admin accordion language instead of looking like a one-off upload block.
- Moved the admin app-drawer launcher into a fixed, higher viewport position so it stays reachable while scrolling long admin screens.
- Rebuilt the public youth album detail page to be more mobile-first by shrinking the album hero, turning oversized inline video cards into compact video tiles, and opening videos in a closable viewer instead of bloating each card.
- Trimmed the youth media landing-page header copy down to a short title and short browse line.
- Built successfully after the latest app-drawer positioning and youth media layout changes.
- Hid `Photos in Albums` and `Gallery Videos` from the admin app drawer so the youth media flow can stay consolidated under one cleaner entry point.
- Restored the admin login flow by turning the dev auto-bypass off by default so `/admin/login` behaves like a real login page again unless explicitly re-enabled by env.
- Added `._*` to `.gitignore` so macOS metadata junk does not get staged into the repo.
- Reworked the `Livestream` admin flow in `components/admin/AdminDashboard.jsx` so stream setup now reads save-first, then `Go Live` / `Stop Live`, with full-width accordion sections for the stream embed and fallback video, stop confirmation, and a built-in stream monitor preview.
- Kept the public live fallback on the looping fallback video path instead of sermon-handoff behavior when the stream is stopped, and preserved viewport position during live/offline toggles so the admin page does not jump around.
- Confirmed the dev servers are running again per repo guardrail:
  - admin/CMS: `http://localhost:3000/admin`
  - website/public: `http://localhost:3001/live`
