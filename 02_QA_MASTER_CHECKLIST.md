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

# LIBERTY CHURCH PWA — MASTER QA CHECKLIST

This checklist is mandatory.

Reference it BEFORE, DURING, and AFTER implementation.

A stage cannot advance with unresolved critical QA failures.

MANDATORY LOOP:

INSPECT
→ PLAN
→ BUILD
→ RUN
→ TEST
→ VISUAL REVIEW
→ QA CHECKLIST
→ FIX
→ RETEST
→ DOCUMENT
→ ADVANCE

---

# A. BEFORE CHANGE

[ ] Existing implementation inspected.
[ ] Site project checked for equivalent functionality.
[ ] App project checked for equivalent functionality.
[ ] Working functionality identified before modification.
[ ] Dependencies identified.
[ ] Routing impact understood.
[ ] Database impact understood.
[ ] Authentication impact understood.
[ ] Permission impact understood.
[ ] Youth-page impact considered.
[ ] Mobile impact considered.
[ ] Installed-PWA impact considered.
[ ] Workbook updated.

---

# B. PUBLIC WEBSITE

[ ] Homepage loads.
[ ] Public navigation works.
[ ] `Login` remains visible in top navigation.
[ ] Desktop navigation works.
[ ] Mobile navigation works.
[ ] Important existing content remains.
[ ] Ministry pages remain reachable.
[ ] Images load.
[ ] Graphics scale correctly.
[ ] Text is readable.
[ ] Buttons are understandable.
[ ] No obvious broken links.
[ ] Footer works.
[ ] No unwanted horizontal scrolling.
[ ] No overlapping elements.
[ ] No clipped content.
[ ] No major layout jumps.
[ ] Page feels intentionally designed.

---

# C. VISUAL POLISH

[ ] Professional appearance.
[ ] Consistent spacing.
[ ] Clear heading hierarchy.
[ ] Consistent buttons.
[ ] Consistent cards.
[ ] Consistent icon treatment.
[ ] Forms are understandable.
[ ] Loading states are clean.
[ ] Empty states look intentional.
[ ] Error states are readable.
[ ] No obvious developer-only UI.
[ ] No placeholder-looking production UI.
[ ] Still feels like Liberty Church.

---

# D. DESKTOP

[ ] Header works.
[ ] Navigation works.
[ ] Login works.
[ ] Content width looks correct.
[ ] Typography looks correct.
[ ] Images scale correctly.
[ ] Cards align correctly.
[ ] Dashboard navigation works.
[ ] No excessive whitespace.
[ ] No cramped layouts.
[ ] Forms usable.
[ ] Tables/lists readable.

---

# E. MOBILE

[ ] Navigation accessible.
[ ] Login easy to find.
[ ] Touch targets usable.
[ ] Text does not overflow.
[ ] Cards fit.
[ ] Forms usable.
[ ] Sidebars adapt properly.
[ ] Role navigation understandable.
[ ] Profile fits.
[ ] Livestream fits.
[ ] No horizontal scroll.
[ ] No required feature hidden.
[ ] No desktop-only interaction required.

---

# F. INSTALLED PWA

[ ] Manifest loads.
[ ] Install works where supported.
[ ] Correct icon.
[ ] Correct application name.
[ ] Correct launch route.
[ ] Navigation works.
[ ] Auth state works.
[ ] Protected routes work.
[ ] Refresh does not break routing.
[ ] Back navigation is logical.
[ ] Does not feel like a broken website wrapper.
[ ] Installed navigation makes sense.
[ ] Loading states intentional.
[ ] Errors do not trap user.

---

# G. YOUTH PAGE — MANDATORY REGRESSION

Perform after shared/global visual changes.

[ ] Youth page loads.
[ ] Standalone Youth CSS still applies.
[ ] Intentional unique design remains.
[ ] Global styles did not override Youth styles.
[ ] Mobile Youth works.
[ ] Desktop Youth works.
[ ] Shared navigation still works.
[ ] Youth content not unintentionally removed.

FAIL = FIX BEFORE ADVANCING.

---

# H. AUTHENTICATION

[ ] Login works.
[ ] Logout works.
[ ] Invalid login gives useful feedback.
[ ] Session persists.
[ ] Session expiry is safe.
[ ] Logged-out users cannot access protected routes.
[ ] Authenticated redirect is correct.
[ ] Mobile login works.
[ ] Installed-PWA login works.
[ ] No unnecessary duplicate auth system.

---

# I. PROFILE

[ ] Authenticated user has correct profile.
[ ] One account represents one person.
[ ] Restricted information is protected.
[ ] Profile works on mobile.
[ ] Profile works installed.
[ ] Profile/user identity can cleanly support future DMs/chat.

---

# J. MULTI-ROLE

Use a test user with several roles.

[ ] One login.
[ ] One profile.
[ ] All authorized workspaces available.
[ ] No separate accounts needed.
[ ] Sidebar includes correct role areas.
[ ] Duplicate menu items avoided.
[ ] Add role adds access.
[ ] Remove role removes access.
[ ] Unauthorized routes remain protected.

---

# K. MEMBER EXPERIENCE

[ ] Member Dashboard loads.
[ ] No staff administration visible.
[ ] No Master Admin tools visible.
[ ] Profile accessible.
[ ] Livestream accessible when implemented.
[ ] YouTube archive accessible when implemented.
[ ] UX is simple.
[ ] Member is not overwhelmed by staff features.

---

# L. WORSHIP SERVICE

[ ] Service exists.
[ ] Worship Leader selects songs.
[ ] Worship Leader orders songs.
[ ] Worship Leader assigns song leader.
[ ] Song leader displayed with correct song.
[ ] Worship Team can see authorized plan.
[ ] One shared source of song information.
[ ] No duplicate manual department song lists required.

---

# M. FOH SOUND

[ ] FOH sees authorized service.
[ ] FOH sees song order.
[ ] FOH sees song leader.
[ ] FOH can identify lead vocalist before/during song.
[ ] FOH does not recreate worship data.
[ ] FOH cannot access unrelated restricted areas.

---

# N. MEDIA TEAM

[ ] Media sees service.
[ ] Media sees worship set.
[ ] Media sees song order.
[ ] Media sees song leader.
[ ] Livestream mix operator can identify lead vocalist.
[ ] Presentation operator can identify songs/order.
[ ] Data comes from shared Service/Worship Plan.
[ ] No duplicate worship-plan entry required.

---

# O. MEDIA STATIONS

Current starting stations:

- Projector Slides
- YouTube / Livestream Mix
- Livestream Slides

[ ] Available stations visible.
[ ] Media user can select station.
[ ] Correct station checklist appears.
[ ] Station names understandable.
[ ] User can change/select appropriately.
[ ] Workflow is simple for volunteers.

---

# P. MEDIA CHECKLIST

[ ] Checklist loads.
[ ] Checklist readable.
[ ] Items can be completed.
[ ] Completion clearly displayed.
[ ] Completion persists.
[ ] User can be recorded where required.
[ ] Timestamp can be recorded where required.
[ ] Shared items supported.
[ ] Station-specific items supported.
[ ] Archived items/templates do not clutter active service.

---

# Q. MASTER ADMIN

[ ] Master Admin can access administration.
[ ] Member cannot access Master Admin.
[ ] Media user cannot access admin unless separately authorized.
[ ] Role management works where implemented.
[ ] Role assignment works where implemented.
[ ] Media station management works where implemented.
[ ] Checklist management works where implemented.
[ ] Operational configuration does not unnecessarily require code changes.

---

# R. PERMISSIONS

For every protected area test:

AUTHORIZED USER
UNAUTHORIZED USER
LOGGED-OUT USER

[ ] Authorized user succeeds.
[ ] Unauthorized user is denied.
[ ] Logged-out user is denied.
[ ] Hiding navigation is not the only security control.
[ ] Data/backend authorization is enforced where applicable.

---

# S. FILES / ARCHIVE

When implemented:

[ ] General files work.
[ ] Ministry files respect authorization.
[ ] Archive works.
[ ] Unauthorized users cannot retrieve restricted files.
[ ] Archived resources do not clutter active views.

---

# T. LIVESTREAM / YOUTUBE ARCHIVE

When implemented:

[ ] Current livestream loads.
[ ] Mobile playback works.
[ ] Desktop playback works.
[ ] Installed-PWA playback works.
[ ] Player remains responsive.
[ ] YouTube archive works.
[ ] Archive navigation understandable.
[ ] Future reactions/chat have architectural space without harming current layout.

---

# U. REGRESSION

After significant changes retest:

[ ] Homepage.
[ ] Public navigation.
[ ] Login.
[ ] Mobile navigation.
[ ] Youth page.
[ ] Authenticated home.
[ ] Profile.
[ ] Role navigation.
[ ] Installed PWA launch.
[ ] Any indirectly touched feature.

Never assume shared-component changes are isolated.

---

# V. PERFORMANCE / CODE QUALITY

[ ] Production build succeeds.
[ ] No obvious console errors.
[ ] No repeated failing network requests.
[ ] No obvious missing assets.
[ ] No avoidable large layout shifts.
[ ] Images reasonably optimized.
[ ] Components not unnecessarily duplicated.
[ ] No obvious infinite loops.
[ ] No unjustified repeated data fetching.

---

# W. DATA INTEGRITY

[ ] Real data not replaced with mock data.
[ ] Database migrations documented.
[ ] Existing data preserved where required.
[ ] Destructive changes intentional.
[ ] Role assignments preserved.
[ ] User/profile relationships preserved.

---

# X. FINAL EXPERIENCE QUESTIONS

## WEBSITE
Does it feel like a polished modern Liberty Church website?
[ ] Yes

## APPLICATION
Does authenticated mode feel like a real application?
[ ] Yes

## PWA
Does installed mode feel natural?
[ ] Yes

## MEMBER
Could a normal member use it without training?
[ ] Yes

## VOLUNTEER
Could a Media Team volunteer quickly understand their station and checklist?
[ ] Yes

## STAFF
Do staff see what they need without unnecessary clutter?
[ ] Yes

## VISUAL
Is anything obviously unfinished, awkward, inconsistent, or developer-only?
[ ] No

---

# Y. STAGE COMPLETION GATE

A stage may advance only when:

[ ] Stage objective completed.
[ ] Production/build test passes.
[ ] Relevant functional QA passes.
[ ] Visual QA passes.
[ ] Mobile QA passes.
[ ] Relevant role/permission QA passes.
[ ] Youth regression passes when applicable.
[ ] Existing functionality regression-tested.
[ ] Critical failures resolved.
[ ] Implementation Workbook updated.
[ ] Next action documented.

FINAL STATUS:

[ ] PASS — ADVANCE

[ ] HOLD — FIX AND REPEAT QA LOOP
