# Next.js Frontend/Behavior QA Report (Workspace-Only)

## Scope
Audited target:
- `_github_golibertychurch_app` only

Routes tested in local workspace app:
- `/`
- `/live`
- `/sermons`
- `/youth`
- `/prayer`
- `/visit`
- `/give`
- `/beliefs`
- APIs: `/api/live-status`, `/api/prayer`, `/api/visit`

---

## Test Execution Summary

### Build/compile
- `npm run build` in `_github_golibertychurch_app`: **PASS** (completed successfully)

### Route reachability (local)
- `/` -> **500**
- `/live` -> **200**
- `/sermons` -> **200**
- `/youth` -> **200**
- `/prayer` -> **200**
- `/visit` -> **200**
- `/give` -> **200**
- `/beliefs` -> **200**

### Browser interaction checks (local)
- Home route visually renders but logs indicate internal/server instability and timeout events.
- Home “A welcome message from Pastor Andrew Stokes” button click did **not** produce visible modal open in tested run.
- Nav click to `Watch Live` works and route changes to `/live`.
- On `/live`, clicking `Beliefs` nav item showed active-state style change without actual navigation in tested run (route appeared to remain on live page).

### API checks (local, prior + current runs)
- `GET /api/live-status` -> **500**
- `POST /api/live-status` -> **405**
- `GET /api/prayer` -> **405**
- `POST /api/prayer` invalid JSON -> **500**
- `POST /api/prayer` valid JSON -> **500**
- `POST /api/prayer` text/plain -> **500**
- `GET /api/visit` -> **405**
- `POST /api/visit` invalid JSON -> **400**
- `POST /api/visit` valid JSON -> **503** (`Supabase is not configured yet.`)
- `POST /api/visit` text/plain -> **500**

---

## Severity-Ranked Findings

## Critical

### 1) Home route intermittently fails with HTTP 500
**Repro steps**
1. Run local app on `localhost:3000`.
2. Request `/` via browser or curl.
3. Observe status/output.

**Expected**
- Home route always returns 200 with stable render.

**Actual**
- `/` returned **500** in route sweep; browser also logged server error/timeout.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/app/page.jsx` (home SSR data usage)
- `_github_golibertychurch_app/lib/content.js` (home data fetch / fallback handling)
- `_github_golibertychurch_app/components/HomeRuntime.jsx` (client runtime effects tied to home)

**Proposed fix**
- Add defensive try/catch + fallback data in `getHomepageContent()` and page render path.
- Ensure home page can render with safe defaults when backend/content fetch fails.
- Log structured error details server-side while returning non-fatal UI fallback.

---

### 2) Prayer API unstable (500 on valid/invalid JSON and text/plain)
**Repro steps**
1. `POST /api/prayer` with JSON body.
2. `POST /api/prayer` with malformed JSON/text payload.
3. Observe status codes.

**Expected**
- Valid request: success or expected configuration error (not 500 crash).
- Invalid payload/content type: controlled `400/415`.
- GET method: `405`.

**Actual**
- Multiple POST cases return **500**, indicating unhandled runtime path.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/app/api/prayer/route.js` (request parsing, validation, error handling)
- `_github_golibertychurch_app/lib/supabase/*` (if called without guard checks)

**Proposed fix**
- Validate `Content-Type` before parsing (`application/json` required).
- Catch JSON parse errors and return `400`.
- Guard env/config before DB call and return deterministic `503`/`500` JSON message.
- Never throw uncaught errors from handler.

---

## High

### 3) Live-status API returns 500 for GET
**Repro steps**
1. Send `GET /api/live-status`.
2. Observe response.

**Expected**
- Return deterministic status payload (`isLive`, URLs, metadata) or safe fallback.

**Actual**
- Returns **500**.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/app/api/live-status/route.js`
- `_github_golibertychurch_app/lib/content.js` (livestream retrieval logic)

**Proposed fix**
- Add fallback JSON response when live source fails.
- Guard missing env/config and return non-crashing payload.
- Include robust error wrapping around upstream calls.

---

### 4) Nav behavior inconsistency in browser interaction (active state changed without route transition)
**Repro steps**
1. Open `/live`.
2. Click `Beliefs` in top navigation.
3. Observe URL and page body.

**Expected**
- URL and content both transition to `/beliefs`.

**Actual**
- Active style reflected selection, but test screenshot still displayed live-page content.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/components/SiteNav.jsx` (link markup and active-state logic)
- `_github_golibertychurch_app/app/globals.css` (active-state class styling that may mask state)

**Proposed fix**
- Verify each nav item uses `next/link` with proper `href`.
- Ensure active class derives from actual pathname after navigation completion.
- Re-test click navigation on all routes.

---

## Medium

### 5) Welcome message CTA did not open visible modal in tested run
**Repro steps**
1. Open `/`.
2. Click “A welcome message from Pastor Andrew Stokes”.
3. Observe modal behavior.

**Expected**
- Welcome modal opens, closable, and re-open behavior matches UX spec.

**Actual**
- No visible modal appeared in the observed run.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/components/HomeRuntime.jsx` (modal open/close handlers and injected content)
- `_github_golibertychurch_app/app/page.jsx` (button id `reopenWelcome` binding)
- `_github_golibertychurch_app/public/welcome.html` (modal content source)

**Proposed fix**
- Verify event listener wiring and DOM readiness.
- Ensure modal root exists and is toggled visible on button click.
- Add fallback inline content when external HTML fetch fails.

---

### 6) Visit API content-type handling not robust
**Repro steps**
1. `POST /api/visit` with `Content-Type: text/plain`.
2. Observe response.

**Expected**
- Return `415 Unsupported Media Type` or `400` with clear JSON error.

**Actual**
- Returns **500**.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/app/api/visit/route.js`

**Proposed fix**
- Validate content-type at route entry.
- Return structured 4xx errors for unsupported payload formats.
- Keep existing 405 method guard.

---

## Low

### 7) Next.js workspace-root warning due to multiple lockfiles
**Repro steps**
1. Run `npm run build` in `_github_golibertychurch_app`.
2. Observe warning.

**Expected**
- Clean build output without root ambiguity warning.

**Actual**
- Warning about inferred workspace root and multiple lockfiles.

**Exact file path(s) and line targets**
- `_github_golibertychurch_app/next.config.mjs` (set `outputFileTracingRoot` if needed)

**Proposed fix**
- Configure `outputFileTracingRoot` to intended monorepo root or remove redundant lockfile in parent path context for this workspace strategy.

---

## Responsive Coverage Status (requested breakpoints)

### <=390px
- **Not fully completed** across all routes in this run.

### 768px
- **Not fully completed** across all routes in this run.

### 1024px
- **Not fully completed** across all routes in this run.

Note:
- Full breakpoint matrix remains pending; current findings are from desktop/local API + targeted interactions.

---

## Parity Checklist

| Page / Feature | Status | Notes |
|---|---|---|
| `/` Home route availability | ❌ Fail | Returned 500 in route sweep |
| Home hero visual render | ⚠ Partial | Rendered in browser snapshot, but with server error/timeouts logged |
| Home welcome modal behavior | ❌ Fail | Reopen button click did not show modal in observed run |
| Home announcements rendering | ⚠ Partial | Not fully validated due to home instability |
| `/live` route availability | ✅ Pass | 200 |
| Live stream rendering/fallback | ⚠ Partial | Page loads, but API status endpoint failing (500) impacts confidence |
| `/sermons` route availability | ✅ Pass | 200 |
| Sermons cards/content parity | ⚠ Partial | Route up, no full visual parity matrix yet |
| `/youth` route availability | ✅ Pass | 200 |
| Youth page parity | ⚠ Partial | Route up, no full breakpoint parity matrix yet |
| `/prayer` route availability | ✅ Pass | 200 |
| Prayer form submit behavior | ❌ Fail | API POST paths returning 500 in tested cases |
| `/visit` route availability | ✅ Pass | 200 |
| Visit form submit behavior | ⚠ Partial | Validation path works (400), valid path blocked by config (503), text/plain causes 500 |
| `/give` route availability | ✅ Pass | 200 |
| `/beliefs` route availability | ✅ Pass | 200 (route exists in current build output) |
| Header/nav cross-route navigation | ⚠ Partial | One observed click anomaly (`/live` -> Beliefs) |
| Footer parity | ⚠ Partial | Not fully re-verified this run |
| Responsive <=390 | ❌ Not completed | Full sweep pending |
| Responsive 768 | ❌ Not completed | Full sweep pending |
| Responsive 1024 | ❌ Not completed | Full sweep pending |
| API `/api/live-status` | ❌ Fail | GET 500 |
| API `/api/prayer` | ❌ Fail | GET 405 (ok), POST scenarios 500 |
| API `/api/visit` | ⚠ Partial | GET 405 (ok), invalid 400 (ok), valid 503 (config), text/plain 500 |

---

## Final Notes
- This report is intentionally restricted to `_github_golibertychurch_app` behavior and test evidence.
- Highest-priority stabilization items are: home 500 path, prayer/live-status API 500s, and deterministic content-type handling for API routes.
- After those are fixed, rerun full responsive/page interaction matrix for final parity closure.

---

## Codex Review Addendum (New Findings)
**Timestamp:** 2026-03-10 02:11:27 UTC

This section is newly added for Codex review and is separate from previously reviewed report content.

### Newly validated results in latest rerun
1. **`/api/live-status` GET now returns 200 with structured fallback JSON**
   - Previously observed as unstable/500 in earlier runs.
   - Current payload confirms non-live fallback behavior is returned correctly.

2. **`/api/prayer` and `/api/visit` content-type handling improved**
   - `Content-Type: text/plain` now returns `415 Unsupported Media Type` (previously 500 in earlier runs).
   - This indicates request validation hardening is now active.

3. **Method guards remain correct**
   - Unsupported verbs still return `405 Method Not Allowed` for tested endpoints.

4. **Home route (`/`) remains critical blocker**
   - Browser launch to `http://localhost:3000/` produced `Internal Server Error` page in latest run.
   - This continues to block full UI parity walkthrough from home-entry flow.

### Exact latest endpoint outcomes (for quick Codex verification)
- `GET /api/live-status` -> `200`
- `POST /api/live-status` -> `405`
- `GET /api/prayer` -> `405`
- `POST /api/prayer` `{}` -> `400`
- `POST /api/prayer` valid JSON -> `503` (`Supabase is not configured yet.`)
- `POST /api/prayer` `text/plain` -> `415`
- `GET /api/visit` -> `405`
- `POST /api/visit` `{}` -> `400`
- `POST /api/visit` valid JSON -> `503` (`Supabase is not configured yet.`)
- `POST /api/visit` `text/plain` -> `415`

### Codex-focused next triage targets
1. Fix `/` server error path first (`app/page.jsx`, `lib/content.js`, `components/HomeRuntime.jsx` integration path).
2. Re-run full browser matrix after `/` is stable:
   - Routes: `/`, `/live`, `/sermons`, `/youth`, `/prayer`, `/visit`, `/give`, `/beliefs`
   - Breakpoints: `<=390`, `768`, `1024`
3. Confirm nav transition correctness (`/live` -> `/beliefs`) with URL + rendered content assertions.

---

## Codex Review Addendum (New Findings)
**Timestamp:** 2026-03-10 02:32:44 UTC

### Newly validated in this pass
1. **Route-state regression observed after prior 200 sweep**
   - `curl` route sweep showed 200 for `/`, `/live`, `/sermons`, `/youth`, `/prayer`, `/visit`, `/give`, `/beliefs`.
   - Shortly after, browser launch to `/beliefs` returned **500 Internal Server Error**.
   - Browser launch to `/sermons` also returned **500 Internal Server Error**.
   - This indicates instability/regression rather than deterministic availability.

2. **`/give` interaction validated with working CTA**
   - `/give` rendered successfully with hero/card/footer sections visible.
   - Clicking “Email our team” triggered:
     - `mailto:give@golibertychurch.com?subject=Giving%20Information`
   - Confirms CTA action path is wired correctly.

3. **Top-nav click no-op behavior reproduced again**
   - From `/give`, clicking `Beliefs` in header did not navigate in tested run.
   - From `/live`, clicking `Beliefs` and `Sermons` also did not transition in tested run (content remained live page).
   - This is consistent with earlier intermittent nav transition failures.

4. **Console asset errors persist globally**
   - Repeated 404 resource load failures continue across `/give` and `/live`.
   - `/live` additionally reported a 500 resource error in console in this pass.

### Severity updates from this pass
- **Critical:** `/beliefs` and `/sermons` now confirmed browser-time 500 failures (despite earlier curl 200 snapshots), indicating unstable SSR/runtime paths.
- **High:** header/nav transitions intermittently no-op across multiple pages.
- **High:** persistent missing assets (404) continue to impact visual parity confidence.
- **Medium:** `/give` CTA interaction is functional and can be marked behavior-pass for mail action.

### Exact file path targets for follow-up triage
- `_github_golibertychurch_app/app/sermons/page.jsx` (runtime render path, dependencies)
- `_github_golibertychurch_app/app/beliefs/page.jsx` (if present) or route wiring fallback in app router
- `_github_golibertychurch_app/components/SiteNav.jsx` (navigation event/link integrity)
- `_github_golibertychurch_app/app/globals.css` (active state styles potentially masking failed transitions)
- `_github_golibertychurch_app/public/*` and referenced asset paths (for repeated 404s)
