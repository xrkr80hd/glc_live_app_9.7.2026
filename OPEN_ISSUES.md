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

## 4) Remove Prefab Ministry/Service-Time Items (User-Managed Only)

Status: Open  
Reason: User requested the homepage ministry section to stop showing prefab/default entries.

What Codex needs to do:
- Remove seeded fallback ministry/service-time items currently rendering in "Our Ministries".
- Keep this section powered by backend-managed entries only ("Ministries and Service Times" in admin).
- Ensure no hardcoded ministry rows appear on the frontend unless explicitly added by admin content.

## 5) Admin UX, Roles, Media Upload, and Content Flow Rebuild (Per Reference)

Status: Open  
Reason: User requested major backend UX cleanup and workflow parity with reference backend.

What Codex needs to do:
- Remove UUID copy/paste workflow from admin forms:
  - Replace manual UUID text fields (album/team/role links) with dropdown/select controls.
  - Use labels in UI, store IDs internally.
- Rebuild role/permission UI so it is clean/comprehensible (not raw/garbled):
  - Clear role creation and assignment flow.
  - Visual separation between admin permissions and standard user permissions.
- Support ministry workflow data flow:
  - Worship/song list created by music minister should be shareable/visible to FOH and media team views.
  - Stage data model and admin screens for this church workflow.
- Home page content rules:
  - No Scripture card on main page.
  - Scripture remains youth-page-only.
  - Main-page card area under hero must be highlight/content card rotation (as designed).
  - Announcements section must render above the "Meet Our Pastor" card.
  - "Welcome to Liberty Church" highlight area is the rotating display zone for editable cards.
  - Each card must support uploaded local media (video or photo), timed display duration, and fade-in/fade-out transitions.
- Media ingestion rules (no external URL dependency as primary workflow):
  - Use file upload/drag-drop from local machine for highlight cards, youth photos, and related media.
  - Keep URL optional only when explicitly needed, not primary.
- Album/photo workflow improvements:
  - Create album once, then upload multiple photos to that album.
  - Allow returning later to add more photos into existing album.
  - Select album from dropdown/list instead of pasting album UUID.
- Pastor content handoff workflow:
  - Pastor can enter sermon title/scripture.
  - That content is available to media team and worship team.
  - Stage this for role-based release.
- Future church user app staging:
  - Prepare for member user access on phone/tablet for sermon notes/download-save workflow.
  - Keep in staged roadmap (not full release yet).
- Live stream + sermons policy:
  - Preserve existing functional backend behavior from reference for livestream/sermons.
  - Modify interface/placement/field sizing only.
  - Sermons tab should be API-populated (no manual URL entry workflow for standard sermon feed).
- Youth minister UI cleanup:
  - Reduce oversized title input boxes in Gallery Videos and Photo sections.
  - Make forms compact, aligned, and professional.
- Archived sermons staging:
  - Keep current archived format.
  - Add roadmap task to support Google Drive link/address fields on sermon cards.
