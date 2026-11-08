# Portal React Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a route for every portal page and make URL navigation work with the sidebar and browser history.

**Architecture:** Wrap the portal in React Router's declarative `BrowserRouter`. Map each role's current `NAV` page IDs to `/admin/{role}/{page}`, derive the current page from the location, and keep the existing page components and role-aware shell.

**Tech Stack:** React 19, Vite 8, React Router declarative APIs.

**Spec:** `docs/superpowers/specs/2026-10-27-portal-react-router-design.md`

## Global Constraints

- Route all IDs in `NAV` for `super`, `subcity`, and `bureau`.
- Keep current page content and in-memory demo session behavior.
- Route paths use `/admin/{role}/{page}`.
- Do not add or run automated tests unless requested.

## Review Focus

- Every sidebar destination resolves to its matching page.
- Overview shortcuts and office actions navigate to the matching URL.
- Direct routes preserve their destination through matching-role demo sign-in.
- Routes for another role return to the signed-in role's overview.
- Back and forward navigation keep the page and active sidebar item in sync.
- Unknown paths recover to the role overview or signed-out login screen.

---

### Task 1: Add React Router and define portal paths

**Files:**
- Modify: `portal/package.json`
- Modify: `portal/package-lock.json`
- Modify: `portal/src/main.jsx`
- Create: `portal/src/routing/portalRoutes.js`

- [x] Add `react-router` and wrap the portal in `BrowserRouter`.
- [x] Define role/page path helpers and derive allowed page IDs from the current portal navigation.

### Task 2: Render portal pages from the route

**Files:**
- Modify: `portal/src/App.jsx`

- [x] Derive the selected role/page from the URL and render each existing page through a matching `<Route>`.
- [x] Preserve the sign-in destination for a matching role, redirect mismatched or unknown routes, and move internal page shortcuts to router navigation.

### Task 3: Make the sidebar use route links

**Files:**
- Modify: `portal/src/components/layout/Sidebar.jsx`

- [x] Replace page-state buttons with active `NavLink` entries built from the shared path helper; retain mobile-close behavior and the current visual treatment.

**Verification:** `npm run build` in `portal/` completed successfully. No automated tests were added or run.

The user requested routing but did not request automated tests; use production builds as compile validation and make no test claims.
