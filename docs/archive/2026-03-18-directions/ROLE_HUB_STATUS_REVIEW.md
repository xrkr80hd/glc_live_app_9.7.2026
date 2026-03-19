# Mobile-First Role Hub Status Review

## What Is Implemented Right Now

- Single member login flow is active through member auth.
- Elevated users get a bottom `See My Admin` button on member home.
- `/dashboard` is now a role hub page (no auto-redirect).
- Hub role cards are horizontal on mobile/tablet and include a conditional CMS card for Pastor/Superuser.
- Role routes exist at `/dashboard/[dashboard]` and render role-specific pages from centralized config.
- Admin bridge path exists for CMS access from member context: `/api/admin/login/member?next=/admin`.

## What Is Not Finished Yet (Backend)

- Full auth/session unification is not done.
- Member APIs and Admin APIs still exist as separate stacks (`/api/member-auth/*` and `/api/admin/*`).
- Current work completed UX flow + session bridge, not deep backend consolidation.

## Why The Role Cards Feel Elongated

- On role pages, tool cards use `min-height: 108px`, which makes each card tall.
- On small screens, CSS forces the tool grid to one column (`@media (max-width: 720px)`), so cards stretch full width and feel long.
- Current copy lengths also increase card height and visual weight.

## Why The Wording Feels Too Explanatory

- Most user-facing dashboard copy comes from `lib/role-dashboard-config.js`.
- Many `subtitle`, `heroBody`, `primaryDescription`, `group.description`, `item.description`, and `callout.body` values are written as implementation explanations.
- Hub text in `components/dashboard/DashboardHubPage.jsx` is also more system-explanatory than user-task focused.

## Files That Control The Current Experience

- `components/dashboard/DashboardHubPage.jsx` (hub title/subtitle/card labels)
- `components/dashboard/RoleDashboardPage.jsx` (role page layout, headings, callouts)
- `components/dashboard/DashboardToolCard.jsx` (tool card structure)
- `lib/role-dashboard-config.js` (all role copy content + tool descriptions)
- `app/globals.css` (hub cards, role tool grid, role card sizing, mobile breakpoints)

## Proposed Step-By-Step Cleanup Plan

1. Copy Simplification Pass
- Replace explanatory/system phrasing with short action-first text.
- Target max lengths:
- `subtitle`: ~4-8 words
- tool description: ~2-6 words
- group description: optional, short
- remove most callout blocks unless truly useful
- Keep role labels simple and consistent.

2. Mobile Card Layout Pass
- Keep role tool cards compact and tappable.
- Change small-screen tool grid from 1 column to 2 columns where possible.
- Reduce `min-height` and tighten spacing/line-height.
- Keep square-corner style system (no pill buttons).

3. Hub Copy + Visual Tightening
- Simplify hub header text and card subtitles.
- Keep role cards short and fast to scan.
- Ensure card titles are clear without extra explanation.

4. Role-By-Role QA Pass
- Check each role on phone and tablet:
- Member
- Media
- Worship
- FOH
- Youth
- Kids
- Pastor
- Bookkeeper
- Superuser
- Confirm no stretched cards, no verbose text, no visual overflow.

5. Backend Unification Plan (Separate Phase)
- Document exactly how to merge member/admin auth stacks safely.
- Implement only after UI cleanup is approved.

## Recommended Next Execution Order

1. Approve copy style rules (short/task-first).
2. I implement copy simplification in role config + hub text.
3. I implement compact mobile card sizing/layout.
4. You review on phone.
5. We do one more tightening pass.
6. Then we move to backend unification.

## Success Criteria For This UI Pass

- Role pages feel compact on phone/tablet.
- Cards are not elongated.
- Text is clear, short, and user-helpful.
- Hub stays horizontal, small, square-cornered, and easy to tap.
- No regression to single-login role-hub behavior.
