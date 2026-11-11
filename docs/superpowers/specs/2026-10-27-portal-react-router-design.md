# Portal React Router Design

## Intent

Give each page in the portal admin app a browser URL so the sidebar, overview shortcuts, browser history, and direct links use the same navigation state.

## Goals

- Use React Router in the portal app only.
- Route every page currently listed in `NAV` for each role.
- Keep existing page components, page data, and role-specific access behavior.
- Use readable role-qualified paths: `/admin/{role}/{page}`.
- Preserve the demo login flow; a matching deep link opens after sign-in.

## Non-goals

- Persist the demo session across reloads.
- Change page content, role permissions, or mock data persistence.
- Add server loaders/actions or data-router behavior.

## Approaches

1. **Declarative React Router (selected):** add `BrowserRouter`, `Routes`, and `Route`, then map the current role/page list to URL paths. This is the smallest change and preserves the existing page components.
2. **Data router:** use `createBrowserRouter` and `RouterProvider`. This supports loaders/actions that the current portal does not use, so it adds setup without solving a present need.
3. **Nested role layouts:** split the existing portal shell and page logic into separate nested route modules. This provides more separation but would require a broad rewrite of the current conditional page tree.

## Routing behavior

- Route identifiers follow the current `NAV` IDs, for example `/admin/super/cms` and `/admin/bureau/routes`.
- Sidebar links and in-page navigation use React Router, so back and forward update the rendered page.
- A route for another role redirects to the signed-in role's overview.
- A direct link while signed out shows the existing login screen. Signing in with the route's role retains the destination; choosing another role opens that role's overview.
- Unknown paths redirect to the signed-in role's overview, or to the login screen while signed out.

## Constraints and implementation calls

- Use the current declarative API from [`react-router`](https://reactrouter.com/start/declarative/installation), not a separate route-module framework.
- Keep the demo session in memory, matching current portal behavior.
- Do not add or run automated tests; verify by production build and code review only.
