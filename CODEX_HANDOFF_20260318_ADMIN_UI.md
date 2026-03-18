# Codex Handoff — Admin UX + Role System (March 18, 2026)

## 1) Current Context
- Repo path on this machine: `f:\REPO\golibertychurch.app-xrkrpc\golibertychurch.app`
- User is actively frustrated with backend/admin UX density and inconsistency.
- Priority is **admin usability + role clarity**, not decorative redesign.
- User asked for handoff so another Codex can continue without re-discovery.

## 2) Runtime / Local Setup
- Docker app container: `glc-app-dev`
- Local app URL: `http://localhost:3001`
- Container port map: `3001 -> 3000`
- Tunnel workflow expected (from Mac to this PC): use forwarded URL that points to local `3001`.

## 3) What Was Already Changed (WIP in this branch)
- Main file touched heavily:
  - `components/admin/AdminDashboard.jsx`
  - `components/admin/AdminDashboard.module.css`
- Adjustments already made:
  - Renamed nav labels for clarity:
    - `Teams & Permissions` -> `Team Roles`
    - `User Accounts` -> `Team Members`
    - `Team Access` -> `Role Assignments (Advanced)` and hidden from main nav
  - Team member role selector:
    - Removed noisy `(role_key)` display in labels for multi-select
    - Removed role icons in selector (`showRoleIcon: false`)
    - Added toggle/search/select-all/clear behavior
    - Filtered out inactive + legacy role keys (`youth_ministry`, `childrens_church`)
  - Livestream form:
    - More compact fields (`compact: true` on key inputs)
    - Explicit fallback wording for outage scenario
  - Upload control in admin forms:
    - Removed drag-drop block
    - Tightened to compact `Choose File` flow + file name display
  - Request Monitor:
    - Switched from always-open large cards to compact summary rows with expand/collapse
  - Album naming clarity:
    - `Photo Albums` -> `Albums`
    - `Album Photos` -> `Photos in Albums`
- Build status:
  - `npm run build` passes after current edits.

## 4) Direct User Requirements (Not Fully Done Yet)
- Replace all “pill/chip-looking” role assignment UI with clean professional list/toggle behavior.
- Admin must be **mobile-first concise**; current backend still feels oversized.
- Request Monitor still needs stronger compact-first UX.
- Ministry Orders must be role-scoped (example: `Children’s Church Orders`) not global-edit chaos for everyone.
- Role/skills visibility must support staffing coverage:
  - Pastor can see who can cover each ministry.
  - Music Minister can see musicians + what they can play/do.
- Service Song Lists: add/restore **PDF <-> ChordPro tooling**, restricted to Music Minister (plus superuser override as appropriate).
- Pastor can create church bulletin; announcements should be permissioned and optionally populated from bulletin.
- Prayer requests must be strictly visibility-restricted (Pastor/Superuser + designated prayer-team roles only).
- Archived sermons requires direct upload flow.

## 5) Product Rules User Locked In
- **Admin/App:** mobile-first, concise-first, then expand on desktop.
- **Website/public site:** desktop/site-first, then shrink responsively.
- Avoid duplicate/confusing admin concepts in nav and form UX.
- Do not make user type massive manual permission matrices repeatedly.

## 6) Recommended Next Execution Order
1. Finalize admin IA (single clear role-management path, hide/retire duplicates).
2. Complete compact mobile-first form system (field sizes, spacing rhythm, control density).
3. Finish Request Monitor compact interaction model and bulk-management ergonomics.
4. Implement role-scoped Ministry Orders UI + API guard alignment.
5. Implement role/capability matrix view (ministry coverage + musician capability visibility).
6. Add Music Minister-only ChordPro/PDF tooling in Service Song Lists.
7. Add bulletin-authoring flow and permissioned announcement derivation.
8. Tighten prayer request visibility policy in API + UI.

## 7) Important Notes
- `.env.local` exists locally and should remain uncommitted.
- There are many unrelated repo changes in working tree from prior passes; do not hard-reset.
- User is okay pausing detailed per-role dashboard mockups until later; core ask now is backend/admin flow quality.

