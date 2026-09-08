## Current user direction — 2026-09-08

- Active build repo: `xrkr80hd/glc_live_app_9.7.2026`.
- Safe preview deployment is authorized through Vercel project `glc-new-preview` (`prj_cBDegCZgScr5e8qb9f6zjqXnL2An`).
- `xrkr80hd/glc_live_site` is the current PHP/static public-site source and is the public foundation for the unified PWA.
- The older app work is reference/reuse material for authenticated features.
- Do not modify or deploy the live PHP site, hosting, DNS, or final production cutover.
- Preserve top-level Login and Youth's standalone visual/CSS treatment.
- Approved test Supabase project remains `ywfvbgblyuqwofejmasv`.

# Planned Work

## Workflow

- LICL before edits: inspect the current Next.js implementation and the equivalent PHP/static source.
- Implement in `glc_live_app_9.7.2026` only.
- Push to the preview repo as work stabilizes; preview deployment is authorized.
- Test the Vercel preview after each meaningful public-shell/PWA patch.
- Run the QA checklist and separately regression-test Youth after shared visual changes.
- Log finished work in `COMPLETED_WORK.md` and keep the implementation workbook current.

## Current Priority — Stage 5 Public PWA Conversion

Turn the current PHP/public Liberty Church site into the polished public front-end of the unified Next.js PWA while preserving useful authenticated functionality from the prior app.

### Immediate conversion pass

1. Public shell parity
   - keep `Login` visible in the top public navigation on desktop and mobile
   - preserve Liberty Church branding, major navigation, footer and public routes
   - compare shared header/footer behavior against the PHP source before further redesign

2. PWA identity/installability
   - remove old `Member Beta` naming
   - launch installed PWA at `/`
   - verify manifest/icons
   - audit service-worker/install behavior and add/repair only as needed

3. Public page parity, one page at a time
   - `/` homepage
   - `/live`
   - `/youth` — standalone regression required
   - `/sermons`
   - `/prayer`
   - `/beliefs`
   - `/give`
   - `/visit`
   For each page: compare current PHP source vs Next.js preview, preserve content/functionality, then polish mobile/desktop behavior.

4. Public data/API migration map
   - identify PHP APIs/data currently backing announcements, livestream status/current stream, prayer requests, visit forms, sermons and youth content
   - map each to existing Next.js/Supabase functionality where present
   - do not create duplicate backends when reusable functionality already exists

5. Visual QA
   - desktop
   - mobile
   - installed PWA
   - Youth separately after global/shared changes

## Current known blockers that do NOT justify touching live PHP

- Successful member login still requires verified server-side Supabase configuration in the preview environment.
- `social_links` previously returned missing-schema/API-cache evidence; inspect test Supabase before any schema change.
- Auth/database functionality must not be marked passed until actually verified.

These remain tracked for the authentication/data stages. They do not authorize live-site deployment or DNS changes.

## Deferred authenticated/admin backlog

Resume after the public PWA milestone is stable unless a new explicit user instruction reprioritizes it:

- youth media admin workflow cleanup
- announcement photo upload/crop UX
- livestream admin manager refinement
- broader status/publish-control cleanup
- service/worship shared plan
- media station/checklist workflow
- FOH/media/worship role integration
- dynamic multi-role navigation

## Current patch in progress

- [x] Rename public account entry to `Login`.
- [x] Keep Login visible on mobile without requiring hamburger navigation.
- [x] Change PWA name from `Liberty Church Member Beta` to `Liberty Church`.
- [x] Change PWA launch route from `/member` to `/`.
- [ ] Confirm preview deployment built successfully.
- [ ] Verify `/`, `/member-access`, `/manifest.webmanifest`, and `/youth` on preview.
- [ ] Continue homepage parity audit against `glc_live_site/index.html`.
