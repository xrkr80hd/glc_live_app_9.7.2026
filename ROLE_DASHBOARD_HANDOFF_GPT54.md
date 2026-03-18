# Liberty Church Role Dashboards - GPT-5.4 Handoff

## Goal
Build the **frontend role dashboard routing layer** inside the existing Next.js member app, using shared app-shell components and matching the uploaded reference anchors.

This is **UI/route implementation only**. Do not invent backend behavior.

## Must-Follow Context
- Use existing shared structure in:
  - `app/`
  - `components/app-shell/`
  - `lib/`
- Reuse `AppShell` and common row/card/button patterns wherever possible.
- Keep Liberty Church visual system:
  - main: clean light theme, green accents
  - youth: dark youth variant only on youth-specific dashboard screens
- Do not render raw placeholder tokens like `[CHURCH_IDENTITY_LINE]` in visible UI.
- Use clean fallback copy and empty states.

## Required Route Layer
Create/implement these routes under `app/dashboard/`:

- `/dashboard/member`
- `/dashboard/worship`
- `/dashboard/music-minister`
- `/dashboard/media`
- `/dashboard/foh`
- `/dashboard/youth`
- `/dashboard/youth/theme`
- `/dashboard/youth/preview`
- `/dashboard/youth/run-of-show`
- `/dashboard/youth/assistant`
- `/dashboard/kids`
- `/dashboard/pastor`
- `/dashboard/bookkeeper`
- `/dashboard/superuser`

Add a clean index entry route:
- `/dashboard` (role-aware redirect + fallback)

## Anchor Alignment Rules
- `8. Pastor Dashboard.png`: Pastor dashboard structure and emphasis.
- `8.1 Bookkeeper Dashboard.png`: separate role dashboard, financial reporting focus.
- `9. Superuser Dashboard.png`: system controls dashboard.
- `4. Media Team Dashboard.png`: production/media workflow emphasis.
- `6.2a Youth Minister Dashboard .png`: **final Youth Minister dashboard** (main youth role screen).
- `6.2b Youth Site Live Preview.png`: **preview screen** (`/dashboard/youth/preview`).
- `6.3 Youth Ministry Run of Show.png`: **sub-tool screen** (`/dashboard/youth/run-of-show`), not separate role.

## Component Reuse Direction
Prefer reuse of:
- `components/app-shell/AppShell.jsx`
- `components/app-shell/ButtonRow.jsx`
- `components/app-shell/SettingsRow.jsx`
- `components/app-shell/MemberAccordion.jsx`
- `components/app-shell/BackRow.jsx`
- `components/app-shell/YouthGlassCard.jsx` (youth screens)

If needed, add shared dashboard primitives (small reusable components) under:
- `components/app-shell/` or `components/dashboard/`

Keep components generic and reusable (not one-off hardcoded blocks per page).

## UX/Hierarchy Expectations
- Strong section hierarchy (purpose-first, then tools).
- Avoid dense, equal-weight tile walls.
- Keep primary actions obvious and top-placed.
- Keep labels plain-language and short.
- Maintain mobile-first spacing and tap clarity.

## Data + State Handling
- Role pages may start with starter/fallback content.
- Do not expose backend field names in visible UI.
- Keep API calls optional for this pass unless existing endpoints already support the needed view.
- No fake production claims; use "coming soon" or clean empty state when necessary.

## Integration Notes
- Do not remove or break existing member routes (`/member/*`).
- Keep youth role dashboards isolated to youth-themed dashboard paths.
- Keep changes additive and conflict-safe.

## Deliverables
1. New dashboard route tree implemented.
2. Shared dashboard components/utilities added (if needed).
3. Screen layouts aligned to anchors with clean hierarchy.
4. Build passes (`npm run build`).
5. Short changelog:
   - files added/updated
   - route map
   - follow-up TODOs (if backend wiring is needed later)

## Out of Scope (for this handoff)
- Backend role/permission enforcement changes.
- Database migrations for roles.
- Rewriting admin APIs.

