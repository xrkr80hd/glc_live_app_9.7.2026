# Liberty Church Role System - Backend Handoff (Pastor-First)

## Goal
Harden the backend role/permission layer so Pastor-led workflows feed all other teams cleanly.

This handoff is **backend only**: role keys, permission checks, API access behavior, and role seeding sanity.

## Priority Outcomes
1. Pastor and Superuser have full review authority where intended.
2. Order request submit/review visibility matches role policy.
3. Bookkeeper access remains constrained to reporting scope.
4. Role keys are canonicalized and consistent across APIs.

## Existing Relevant Files
- `lib/admin-role-access.js`
- `app/api/admin/ministry-order-requests/route.js`
- `app/api/admin/ministry-order-requests/[id]/route.js`
- `app/api/admin/bookkeeping-reports/route.js`
- `app/api/admin/bookkeeping-reports/[id]/route.js`
- `app/api/admin/team-roles/route.js`
- `app/api/admin/team-roles/[id]/route.js`
- `components/admin/AdminDashboard.jsx` (role presets + labels used in admin UX)

## Canonical Role Keys (target)
- `pastor`
- `superuser`
- `bookkeeper`
- `media_team`
- `foh_sound`
- `worship_team`
- `worship_leader` (music minister equivalent)
- `youth_minister`
- `youth_minister_assistant`
- `kids_church`

## Required Permission Matrix
### Order Requests
- Submit allowed:
  - `worship_leader`
  - `youth_minister`
  - `youth_minister_assistant`
  - `kids_church`
  - `media_team`
  - `foh_sound`
  - `pastor`
  - `superuser`
- Approve/deny + pastor notes:
  - `pastor`
  - `superuser`
- Visibility:
  - `pastor` and `superuser`: all requests
  - submitter roles: requests tied to their role(s), plus their own submitted requests
  - youth leadership rule: `youth_minister` can view requests from `youth_minister_assistant`
  - optional bookkeeper visibility: only if explicitly enabled (feature flag)

### Bookkeeping Reports
- Full CRUD:
  - `bookkeeper`
  - `pastor`
  - `superuser`
- No access:
  - all other ministry roles unless explicitly expanded later

## Status Compatibility Requirement
Current API uses:
- `new`, `reviewing`, `ordered`, `fulfilled`, `declined`

Role instructions use:
- Draft, Submitted, Under Review, Approved, Denied, Ordered, Completed

Implement a compatibility map in backend normalization without breaking current data:
- `submitted` -> `new`
- `under_review` -> `reviewing`
- `approved` -> `ordered` (or review and choose explicit new enum path)
- `denied` -> `declined`
- `completed` -> `fulfilled`
- `draft` -> `new` (or reject for now with clear message)

If enum migration is not done now, keep DB values stable and normalize input aliases.

## Implementation Direction
1. Add centralized helper(s) in `lib/admin-role-access.js` (or a new `lib/admin-role-policies.js`):
   - normalize role keys with aliases
   - `canSubmitOrderRequests(roleKeys, isSuperuser)`
   - `canReviewOrderRequests(roleKeys, isSuperuser)`
   - `canAccessBookkeeping(roleKeys, isSuperuser)`
   - `canViewAllOrderRequests(roleKeys, isSuperuser)`
2. Refactor order request routes to use shared policy helpers.
3. Keep pastor-notes write locked to reviewer roles only.
4. Add optional env-gated branch for bookkeeper order visibility:
   - `BOOKKEEPER_ORDER_VISIBILITY=true`
5. Ensure `team-roles` POST/PATCH keeps canonical role names stable for known keys.
6. Preserve backward compatibility for existing role keys and API consumers.

## Sanity/Verification Checklist
- Pastor can list all ministry order requests.
- Superuser can list all ministry order requests.
- Non-pastor ministry role cannot approve/deny.
- Youth Minister can see assistant youth requests.
- Bookkeeper can access bookkeeping endpoints.
- Non-bookkeeper/non-pastor blocked from bookkeeping endpoints.
- No regression to admin login/session behavior.
- Build passes: `npm run build`.

## Deliverables
1. Updated backend role policy helpers.
2. Refactored API guard logic using shared policy helpers.
3. Status normalization aliases (non-breaking).
4. Short changelog with files touched and policy decisions.

## Out of Scope
- Frontend dashboard page layout work.
- New UI route scaffolding.
- Full DB enum migration for new status vocabulary (unless explicitly requested).

