# Open Issues (Current)

This is the only active tracking file for unresolved items.
Old QA/next-step markdown reports were removed because they contained outdated errors that are already fixed.

## 1) Admin Login Not Working On Current Preview Deployment

Status: Open  
Symptom: `/admin/login` shows "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET."

What is already done:
- Admin login system is implemented in app code.
- Required env vars were provided by user.

What still needs to happen:
- Ensure these vars exist in Vercel for the exact project and environment used by the current deployment:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
- Redeploy latest commit.
- Verify:
  - `GET /api/admin/me` returns `"configured": true`
  - login succeeds at `/admin/login`

## 2) Final Visual QA After Latest Fixes

Status: Open  
Reason: Latest patches were pushed after user-reported UI issues and need a deployment-level visual recheck.

Recheck these items on deployed site:
- `/live`: fallback uses configured stream fallback video.
- `/prayer`: updated form styling/layout is acceptable.
- `/youth`: hero left/right spacing matches home hero alignment.
- `/`: seasonal card appears under hero (with fallback content when no active row exists).

## 3) Exact Frontend Parity With Live Site

Status: Open  
Reason: User requested exact look/feel parity across all pages. This requires a full page-by-page pass against `www.golibertychurch.com`.

Scope to verify:
- Home
- Live
- Sermons
- Youth
- Prayer
- Visit
- Give
- Beliefs

