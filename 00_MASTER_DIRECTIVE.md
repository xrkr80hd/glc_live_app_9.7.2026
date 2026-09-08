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

# LIBERTY CHURCH PWA — MASTER PROJECT DIRECTIVE

## 1. PURPOSE

This document is the permanent source of truth for the Liberty Church PWA project.

Before making architectural, visual, database, routing, authentication, role, or application decisions, read this document and reference:

- `01_IMPLEMENTATION_WORKBOOK.md`
- `02_QA_MASTER_CHECKLIST.md`

These documents are not optional notes. They are the control system for the project.

---

# 2. PROJECT SOURCES

Astra has access to:

- `glc_live_site-main`
- `glc_live_app-main`

They are NOT competing projects.

## `glc_live_site-main`

This is the ACTUAL CURRENT LIVE CHURCH WEBSITE.

It is the public-facing foundation of the final PWA and contains the current Liberty Church:

- pages
- navigation
- visual identity
- ministry information
- imagery
- icons
- layouts
- livestream information
- public content
- public functionality

DO NOT throw this away.

Preserve what works. Polish what needs improvement.

## `glc_live_app-main`

This contains previous application work and may include:

- authentication
- dashboards
- role logic
- staff/member experiences
- profiles
- application navigation
- files
- messaging concepts
- database structures
- administrative functionality
- PWA work
- partially completed features

Inspect before deciding what survives.

Do not assume attractive UI is functional.
Do not assume incomplete code is useless.
Do not rebuild working functionality merely because you would implement it differently.

---

# 3. FINAL PRODUCT

The end result is ONE LIBERTY CHURCH PROGRESSIVE WEB APP.

The current public website becomes the public side of that PWA.

Logging into the SAME PWA unlocks the member/staff experience.

The product should feel like:

PUBLIC LIBERTY CHURCH PWA
↓
LOGIN
↓
PERSONALIZED AUTHENTICATED LIBERTY CHURCH EXPERIENCE

It must NOT feel like an unrelated website and admin application bolted together.

---

# 4. FIRST MAJOR GOAL

The first implementation milestone is NOT completion of every administrative feature.

The first milestone is:

## TURN THE CURRENT LIVE WEBSITE INTO THE POLISHED PUBLIC FRONT-END OF THE FINAL PWA.

Use the live site as the public structure/content foundation.

Use the strongest application shell/components from the old app when they improve the final experience.

The public experience should:

- retain Liberty Church identity
- preserve important content
- work well on desktop
- work well on mobile
- work well when installed as a PWA
- feel cohesive and modern
- remain recognizable as the existing Liberty Church site
- preserve working functionality
- gain polish without unnecessary redesign

---

# 5. CRITICAL PUBLIC RULES

## LOGIN

KEEP THE `Login` tab visible in the TOP public navigation.

Do not hide Login exclusively inside:

- hamburger submenus
- account/profile icons
- footers
- floating buttons
- automatic redirects

The public site should retain an obvious Login entry.

## YOUTH PAGE

The Youth page is an intentional design exception.

It has standalone styling/CSS and should retain its unique appearance.

Whenever shared/global CSS, layout, navigation, wrappers, typography, spacing, or components are changed:

TEST THE YOUTH PAGE SEPARATELY.

Do not globally normalize the Youth page.

---

# 6. USER MODEL

Every authenticated person receives ONE account and ONE profile.

Do NOT create separate accounts for separate ministry roles.

Architecture:

USER
→ PROFILE
→ BASE MEMBER EXPERIENCE
→ MULTIPLE ASSIGNED ROLES
→ AUTHORIZED WORKSPACES

A person may hold several roles simultaneously.

---

# 7. BASE MEMBER EXPERIENCE

Base role:

`church_member`

A normal member should eventually have:

- Member Dashboard
- Profile
- Church announcements
- Member resources
- Livestream
- YouTube service archive
- Notifications
- Appropriate files/resources

Future functionality:

- Direct Messages
- Church Chat
- Livestream chat
- Likes
- Amen reactions
- other appropriate reactions

Do not allow realtime chat development to derail the first implementation milestones.

Architect for it and stage it later.

---

# 8. PROFILE SYSTEM

Every authenticated:

- member
- volunteer
- musician
- staff member
- ministry leader
- pastor
- administrator

should have a profile.

The profile is the identity anchor for the PWA.

The architecture should eventually allow:

- viewing appropriate profile information
- account/profile management
- Direct Messages
- ministry/team context
- church chat participation

---

# 9. ROLE SYSTEM

Core administrative role:

`master_admin`

Current ministry/staff roles:

- `media_team`
- `worship_team`
- `foh_sound`
- `pastor`
- `worship_leader`
- `youth_minister`
- `youth_minister_assistant`
- `childrens_church`
- `kids_church`
- `lay_staff`
- `mens_ministry_leader`
- `womens_ministry_leader`

MULTIPLE ROLES PER USER ARE REQUIRED.

A user may be:

`church_member`
+
`worship_team`
+
`media_team`
+
`youth_minister`

with ONE login.

---

# 10. DYNAMIC AUTHENTICATED NAVIGATION

The authenticated left-side navigation should populate from actual assigned access.

Example:

- Home
- Member Dashboard
- Worship Team
- Media Team
- Youth Ministry
- Files
- Messages
- Profile

Only show authorized areas.

Avoid displaying large numbers of empty or unfinished dashboards.

---

# 11. MASTER ADMIN

`master_admin`

Master Admin eventually manages:

- users
- profiles
- roles
- role assignments
- ministry configuration
- permissions
- files
- archives
- announcements
- media stations
- media checklists
- system/application configuration

Where practical, Master Admin should be able to change operational configuration without editing application code.

---

# 12. WORSHIP TEAM

`worship_team`

Worship Team members may have one or multiple instrument assignments.

Examples:

- vocals
- acoustic guitar
- electric guitar
- bass
- drums
- piano
- keyboard
- other instruments

Do NOT create separate accounts per instrument.

Conceptual structure:

USER
→ WORSHIP TEAM MEMBERSHIP
→ INSTRUMENT ASSIGNMENTS

---

# 13. WORSHIP LEADER

`worship_leader`

The Worship Leader should eventually be able to:

- create worship sets
- select songs
- order songs
- assign WHO LEADS EACH SONG
- add service/worship notes
- make the same service plan available to authorized teams

The Worship Leader's plan should become a SHARED SOURCE OF TRUTH.

---

# 14. SONG LEADER / VOCALIST REQUIREMENT

Every worship song should support assignment of:

- Song
- Song Leader / Lead Vocalist

This information must be available to authorized:

- Worship Team
- Media Team
- FOH Sound

Why:

FOH Sound needs to know who is leading each song so the proper vocalist can be brought forward in the house mix.

The Media Team member mixing the livestream needs to know who is leading so the appropriate vocalist can be featured online.

Presentation operators need song order to prepare lyrics/slides.

Workflow:

WORSHIP LEADER
→ BUILDS SERVICE PLAN
→ ASSIGNS SONGS
→ ASSIGNS SONG LEADERS
→ WORSHIP / MEDIA / FOH RECEIVE AUTHORIZED INFORMATION

Do not create separate duplicate song lists for each department.

---

# 15. SERVICE AS SHARED OPERATIONAL OBJECT

Do NOT build disconnected ministry apps.

A SERVICE may contain:

SERVICE
├── Date / Time
├── Worship Set
├── Songs
├── Song Leaders
├── Worship Team
├── FOH Information
├── Media Team
├── Media Stations
├── Media Checklists
├── Service Notes
└── Related Resources

Different roles view the pieces they are authorized to use.

---

# 16. MEDIA TEAM

`media_team`

Media Team should receive relevant service information from the shared Service/Worship Plan.

This may include:

- song order
- song leader
- worship set
- service notes
- presentation information
- readiness/checklist information

The PWA should remain presentation-platform independent.

External tools may include:

- EasyWorship
- ProPresenter
- OBS
- other presentation/streaming software

The PWA manages church information and workflow.

It should not be tightly coupled to one presentation product.

---

# 17. FOH SOUND

`foh_sound`

FOH Sound should eventually see:

- service
- worship order
- songs
- song leaders
- vocalist information
- relevant production/audio notes

FOH should use the SAME shared service plan as Worship and Media.

---

# 18. CURRENT MEDIA TEAM STATIONS

Current starting stations:

- `projector_slides`
- `youtube_livestream_mix`
- `livestream_slides`

These represent the current workflow.

They may change later.

Do not permanently hard-code them.

Master Admin should eventually be able to:

- create stations
- rename stations
- deactivate stations
- archive stations
- assign/edit checklists

---

# 19. MEDIA TEAM READINESS / CHECKLIST SYSTEM

Before service:

MEDIA TEAM MEMBER
→ OPENS SERVICE
→ SELECTS STATION
→ SEES APPLICABLE CHECKLIST
→ VERIFIES ITEMS
→ COMPLETES READINESS

The user experience must remain extremely simple.

A volunteer should immediately understand:

"What do I need to check before service?"

The system should support:

- shared Media checklist items
- station-specific checklist items
- completion status
- who completed an item where appropriate
- timestamp where appropriate
- archived/inactive templates

Master Admin should eventually be able to:

- create checklist templates
- edit templates
- archive templates
- add/reorder items
- assign checklist items to stations
- manage stations

---

# 20. EXAMPLE CURRENT CHECKLIST AREAS

These are examples, NOT permanent hard-coded requirements.

## Projector Slides

May include:

- presentation computer ready
- projector output verified
- worship songs loaded
- sermon slides loaded
- video/media loaded
- order verified

## YouTube / Livestream Mix

May include:

- livestream destination ready
- stream connection healthy
- cameras operational
- audio feed verified
- livestream mix verified
- recording enabled if needed

## Livestream Slides

May include:

- lyrics ready
- sermon graphics ready
- lower thirds ready
- online slide output verified

If similar functionality already exists in the old app, preserve and improve it.

---

# 21. YOUTH MINISTRY

Roles:

- `youth_minister`
- `youth_minister_assistant`

Both should work in ONE shared Youth Ministry workspace with different levels of authority.

Do not create duplicate youth systems.

Remember:

PUBLIC YOUTH PAGE DESIGN
and
AUTHENTICATED YOUTH MANAGEMENT

are related but different.

The public Youth page keeps its unique CSS/design.

---

# 22. CHILDREN'S MINISTRIES

Current concepts:

`childrens_church`
- preschool

`kids_church`
- intended for elementary age

If existing church content proves different official names, document that before changing names.

Do not invent church terminology.

---

# 23. LAY STAFF

`lay_staff`

Potential assignments/capabilities include:

- greeter
- usher
- prayer-request access
- other lay responsibilities

Prefer assignments/capabilities under Lay Staff over creating excessive top-level roles where practical.

Do not over-engineer yet.

---

# 24. MEN'S / WOMEN'S MINISTRY

Roles:

- `mens_ministry_leader`
- `womens_ministry_leader`

Eventually provide appropriate:

- planning
- schedules
- files
- announcements
- resources
- communication

Reuse shared application systems instead of building isolated applications.

---

# 25. PASTOR

`pastor`

Pastoral role is ministry authority.

Do NOT automatically treat `pastor` as unrestricted technical administration.

Keep ministry authority and technical system administration distinct when appropriate.

---

# 26. FILES / ARCHIVE

Eventually support:

- Global Church Files
- Ministry Files
- Role-Scoped Files
- Archived Files

Permissions determine access.

Example:

A Media Team member should not automatically see private Youth Ministry files.

---

# 27. COMMUNICATION

Future architecture should support:

- Direct Messages
- Ministry Chat
- Staff Chat
- Church Chat
- Announcements
- Notifications
- Livestream Chat
- Likes
- Amen reactions

Do not prioritize the full realtime communication system during the initial public-PWA conversion unless significant working code already exists.

Stage it.

---

# 28. LIVESTREAM / ARCHIVE

Authenticated members should eventually be able to:

- watch the current livestream
- access the YouTube service archive
- stay inside the PWA as much as practical
- see related church information
- eventually use livestream interaction

Member UX must remain simple.

---

# 29. SHARED ARCHITECTURE PHILOSOPHY

DO NOT BUILD 12 DISCONNECTED DASHBOARDS.

Prefer shared entities such as:

- USER
- PROFILE
- ROLE
- ROLE ASSIGNMENT
- MINISTRY
- SERVICE
- EVENT
- SONG
- WORSHIP SET
- SONG LEADER
- MEDIA STATION
- CHECKLIST
- CHECKLIST ITEM
- FILE
- ARCHIVE
- MESSAGE
- CONVERSATION
- ANNOUNCEMENT
- PRAYER REQUEST
- NOTIFICATION
- LIVESTREAM

Roles interact with these shared objects according to permission.

---

# 30. MANDATORY DEVELOPMENT LOOP

FOR EVERY STAGE:

INSPECT
↓
DOCUMENT FINDINGS
↓
PLAN
↓
CHECK PLAN AGAINST THIS MASTER DIRECTIVE
↓
IMPLEMENT
↓
BUILD / RUN
↓
FUNCTIONALLY TEST
↓
VISUALLY INSPECT
↓
CHECK `02_QA_MASTER_CHECKLIST.md`
↓
FIX FAILURES
↓
RETEST
↓
UPDATE `01_IMPLEMENTATION_WORKBOOK.md`
↓
ONLY THEN ADVANCE

If critical QA fails:

DO NOT ADVANCE.

---

# 31. STAGED IMPLEMENTATION

## STAGE 0 — PROJECT BASELINE

Inspect BOTH sources.

Identify:

- frameworks / versions
- package managers
- folder structure
- public routes
- authenticated routes
- backend
- database
- authentication
- environment dependencies
- PWA configuration
- role logic
- dashboards
- profiles
- files
- messages
- existing checklists
- media functionality
- shared components
- duplicates
- broken code
- dead/unused components

DO NOT MODIFY CODE.

Update the Workbook.

## STAGE 1 — LIVE SITE AUDIT

Inspect and classify the public site:

- pages
- navigation
- Login
- homepage
- ministry pages
- Youth
- livestream
- imagery
- forms
- footer
- desktop behavior
- mobile behavior

Classify:

KEEP
POLISH
MERGE
REPAIR
REBUILD ONLY IF NECESSARY

## STAGE 2 — APP AUDIT

Inspect:

- auth
- users
- profiles
- roles
- multi-role capability
- sidebars
- dashboards
- files
- checklists
- messages
- admin systems
- PWA configuration

Classify:

WORKING
PARTIAL
UI ONLY
BROKEN
REUSABLE
DEAD CODE
NEEDS REFACTORING

## STAGE 3 — MERGE MAP

For every major capability record:

SOURCE = SITE
SOURCE = APP
SOURCE = BOTH
NEW WORK REQUIRED

Do this BEFORE major implementation.

## STAGE 4 — TARGET ARCHITECTURE

Define:

- routing
- public shell
- authenticated shell
- user/profile model
- roles
- role assignments
- ministries
- shared Service model
- dynamic navigation
- files
- future messaging architecture

Do not rewrite everything blindly.

## STAGE 5 — PUBLIC PWA CONVERSION

FIRST MAJOR BUILD MILESTONE.

Turn the live site into the polished public side of the unified PWA.

Maintain:

- content
- branding
- major navigation
- TOP Login tab
- URLs where practical
- Youth styling

Improve:

- consistency
- responsiveness
- mobile UX
- application feel
- reusable components
- manifest
- icons
- installability
- accessibility
- performance
- visual polish

This stage should produce something appropriate for normal public use.

## STAGE 6 — AUTHENTICATION BRIDGE

Connect public Login to the best existing authentication implementation.

Verify:

- login
- logout
- session persistence
- protected routes
- password recovery if available
- registration if available
- role loading
- redirects
- mobile
- installed PWA

## STAGE 7 — USER / PROFILE FOUNDATION

Verify:

- one account per person
- profile
- base member experience
- safe profile access
- role relationship architecture

## STAGE 8 — MULTI-ROLE ENGINE

Implement/repair multiple role assignment.

Test a user with multiple simultaneous roles.

## STAGE 9 — DYNAMIC NAVIGATION

Test navigation for:

- member-only
- worship
- media
- FOH
- youth
- multi-role user
- pastor
- master_admin

## STAGE 10 — FIRST CONNECTED SERVICE WORKFLOW

Build proof-of-concept around one SERVICE.

Use:

WORSHIP LEADER
+
WORSHIP TEAM
+
MEDIA TEAM
+
FOH SOUND

Minimum proof:

- Worship Leader assigns songs
- Worship Leader assigns song leaders
- Worship Team sees plan
- Media sees song/order/leader
- FOH sees song/order/leader
- Livestream mix knows lead vocalist
- Presentation operators know song order
- All information comes from ONE service plan

## STAGE 11 — MEDIA READINESS

Current starting stations:

- Projector Slides
- YouTube / Livestream Mix
- Livestream Slides

Allow Media users to:

- select service
- select station
- see checklist
- confirm readiness

Allow Master Admin to manage station/checklist configuration.

## STAGE 12 — MEMBER EXPERIENCE

Polish:

- dashboard
- profile
- livestream
- YouTube archive
- announcements
- resources
- appropriate files

Keep it simple.

## STAGE 13 — ADDITIONAL MINISTRIES

Progressively connect:

- Youth
- Children's Church
- Kids Church
- Lay Staff
- Men's Ministry
- Women's Ministry
- Pastoral functionality

Reuse shared systems.

## STAGE 14 — COMMUNICATION

After identity/roles/permissions are stable:

- Direct Messages
- Ministry Chat
- Staff Chat
- Church Chat
- Notifications
- Livestream interaction

Prefer one shared communication architecture.

## STAGE 15 — FINAL HARDENING

Test:

- desktop browser
- tablet
- mobile browser
- installed PWA
- logged out
- member
- multi-role user
- ministry leader
- pastor
- master_admin

Test all permission boundaries.

---

# 32. STRICT RULES

DO NOT REBUILD BEFORE INSPECTING.

DO NOT DELETE WORKING FUNCTIONALITY WITHOUT DOCUMENTED REASON.

DO NOT SUBSTITUTE MOCK DATA FOR REAL FUNCTIONALITY.

DO NOT CLAIM UI-ONLY FEATURES ARE WORKING.

KEEP LOGIN IN THE TOP PUBLIC NAVIGATION.

PROTECT THE YOUTH PAGE AND ITS STANDALONE STYLING.

SUPPORT MULTIPLE ROLES PER USER.

BUILD SHARED WORKFLOWS, NOT DISCONNECTED ROLE APPS.

DO NOT BUILD EVERYTHING AT ONCE.

DO NOT ADVANCE WITH UNRESOLVED CRITICAL QA FAILURES.

REFERENCE `02_QA_MASTER_CHECKLIST.md` THROUGHOUT THE PROJECT.

UPDATE `01_IMPLEMENTATION_WORKBOOK.md` AFTER EVERY MEANINGFUL STAGE/WORK SESSION.

The goal is not merely code that runs.

The goal is a Liberty Church PWA that is polished, cohesive, simple, reliable, and excellent both as a website and as an installed application.
