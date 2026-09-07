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

## Active checkpoint

1. Finish baseline build, startup, route and visual verification using the uploaded app source.
2. Resolve connector access to the user-designated test services; inspect existing schema before migrations.
3. Preserve historical youth-admin queue below; do not advance past a failed baseline gate.

# Planned Work

## Workflow

- LICL before acting: inspect the current local code/context first.
- Read this file before starting or resuming queued work.
- Implement the current plan before switching tasks unless the user explicitly says `STOP` and reprioritizes.
- If the user raises a new issue but does not explicitly say `STOP`, add it here and keep working through the current operation.
- After finishing a task, re-check this file for anything missed before moving on.
- Log finished work in `COMPLETED_WORK.md`.

## Current Priority

- Finish reorganizing the youth media manager in admin so the album/photo/video flow feels like one clean youth workflow instead of three awkward split tools.

## Active Queue

- Keep the youth media tools under the `Youth Page` accordion and continue tightening that flow:
  - album creation should stay simple first
  - photo upload should clearly target the selected album
  - video handling needs a cleaner album connection
- Decide whether to add `gallery_videos.album_id` so videos are explicitly linked to albums instead of matched by heuristics.
- Review the current admin media screens for layout and organization problems and tighten that UI using the repo's agent system before editing.
- Finish the announcement admin UX cleanup:
  - add a clean announcement photo upload/crop flow
  - keep the form compact and understandable
  - keep posted timestamp and move up/down controls backend-only
  - keep edit, save, and delete behavior obvious
- Fix the `Livestream` admin tab so it behaves like one usable live-stream manager instead of an awkward generic form:
  - review whether the tab should act like one current stream record instead of a loose stack of entries
- Fix the admin app-drawer launcher so it stays reachable while scrolling long admin pages instead of feeling parked back at the top.
- Tighten the public youth album detail page with a smaller mobile-first hero, smaller video cards, and a clean closable video viewer so videos stop dominating the screen.
- Trim overexplained public-page header copy across the site without touching the home-page hero.
- Standardize the remaining public footer styling/details now that admin-managed social links are flowing through the main public shell.
- Do a broader pass on status/publish controls after the media workflow reorganization so remaining unwanted publish/active controls are removed intentionally instead of piecemeal.
- Remove prefab/default ministry rows from the homepage so the ministry section is backend-managed only.
- Fix the homepage pastor photo mobile crop so the top of the photo is not cut off on phone-sized screens.
- Do a full frontend parity pass page by page once the current footer and admin cleanup work stabilizes.
