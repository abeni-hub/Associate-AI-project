# Portal App Componentization Design

## Intent

Restructure the CivicLink admin portal into clear page modules and focused section components. The current `portal/src/App.jsx` combines role-based routing, the admin shell (sidebar, topbar), login screen, static data constants, SVG icon definitions, QR code generation, modal forms, and the markup for ten page views — all in a single 589-line file. The goal is to make each page and each substantial section easier to understand and maintain while keeping the existing admin experience intact.

## Goals

- Keep `App.jsx` responsible for session state, role selection, active-page routing, global search/filter state, data collections, modal orchestration, and rendering the common admin shell.
- Extract the login screen into its own page module under `portal/src/pages/`.
- Extract each admin view (overview, sub-cities, accounts, bureaus, services, feedback, news, routes, QR codes, office profile, activity log) into focused page modules under `portal/src/pages/`.
- Move shared layout components (sidebar, topbar) into `portal/src/components/layout/`.
- Move shared UI components (Icon, Brand, SearchBox, StatusPill, TypePill, MetricCard, PageHeading) into `portal/src/components/ui/`.
- Move modal components (Modal shell, ModalForm, RouteEditor, FeedbackDetail, QRDialog) into `portal/src/components/modals/`.
- Move page-specific sections into component folders grouped by their owning page.
- Move all static data constants into `portal/src/data/portalData.js`.
- Move QR code generation logic into `portal/src/utils/qrCode.js`.
- Preserve existing CSS class names, DOM IDs, visual behavior, and user interactions.
- Reuse the existing React/Vite setup without adding dependencies.

## Non-goals

- Redesign the screens or change page copy.
- Introduce a routing library or change page-selection behavior.
- Change the data model, mock data values, or modal form field definitions.
- Split or rewrite the existing `App.css` stylesheet as part of this refactor.

## Constraints and Existing State

- The portal is a React 19/Vite app with role-based page selection implemented in `App.jsx`.
- The entire portal lives in `portal/src/App.jsx` (589 lines, ~88 KB) and `portal/src/App.css` (~71 KB).
- There is no existing `pages/`, `components/`, `data/`, or `utils/` directory under `portal/src/`.
- The app has three demo roles (`super`, `subcity`, `bureau`) with different nav structures and data visibility.
- The QR code generation uses a pure-JS Reed–Solomon encoder that should remain self-contained.
- Keep current DOM IDs and CSS class names so existing styles continue to work.

## Approaches Considered

1. **Extract JSX while leaving all state in `App.jsx`.** This would shorten the render block but `App.jsx` would still own every piece of page-local state (filters, search, chart period) and remain difficult to read.
2. **Separate pages and assign state to its owning page or section; extract data and utilities into dedicated modules.** `App.jsx` keeps session, routing, and data collection state; each page owns its own local filters and search; shared layout and UI components move to focused modules. This mirrors the client app's decomposition and is the selected approach.
3. **Introduce a state management library and router.** This would add dependencies and change the app architecture beyond what the refactor requires.

## Selected Architecture

`App.jsx` remains the single app entry component. It owns: session/login state, active role, active page ID, global data collections (subcities, bureaus, accounts, services, routes, feedback, posts), search/filter state, modal state and open/close handlers, navigation callbacks, and CRUD operations. It renders `Login` when there is no session, and the admin shell (`Sidebar`, `Topbar`, active page, `Modal`) when signed in.

### Directory Structure

```
portal/src/
├── App.jsx                         (session, routing, data, modal orchestration, shell)
├── App.css                         (unchanged)
├── main.jsx                        (unchanged)
├── index.css                       (unchanged)
├── data/
│   └── portalData.js               (ROLE, NAV, all INITIAL_* constants)
├── utils/
│   └── qrCode.js                   (qrGfMultiply, qrErrorCorrection, feedbackQrMatrix)
├── pages/
│   ├── LoginPage.jsx               (login form, demo role selector, story panel)
│   ├── OverviewPage.jsx            (dashboard composition, period toggle, quick actions)
│   ├── SubcitiesPage.jsx           (sub-city table, directory overview, search)
│   ├── AccountsPage.jsx            (accounts table, role filters, metrics)
│   ├── BureausPage.jsx             (bureau table, completion bars, search)
│   ├── ServicesPage.jsx            (service cards, publish toggle, filters)
│   ├── FeedbackPage.jsx            (feedback inbox table, type/status filters, metrics)
│   ├── NewsPage.jsx                (news/event list, feature banner, publish toggle)
│   ├── RoutesPage.jsx              (route cards, mini-route previews, search)
│   ├── QRPage.jsx                  (QR hero, stats, flow instructions)
│   ├── OfficePage.jsx              (office profile card)
│   └── ActivityPage.jsx            (activity log timeline)
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx             (nav groups, workspace badge, help card, profile)
│   │   └── Topbar.jsx              (breadcrumb, notifications popover, profile popover)
│   ├── ui/
│   │   ├── Icon.jsx                (SVG icon component with all portal icons)
│   │   ├── Brand.jsx               (brand lockup with compact variant)
│   │   ├── SearchBox.jsx           (search input with clear button)
│   │   ├── StatusPill.jsx          (status indicator pill)
│   │   ├── TypePill.jsx            (feedback type pill)
│   │   ├── MetricCard.jsx          (metric card with icon, value, trend)
│   │   └── PageHeading.jsx         (page header with eyebrow, title, actions)
│   ├── modals/
│   │   ├── Modal.jsx               (overlay shell, kind-based dispatch)
│   │   ├── ModalForm.jsx           (dynamic form with fields config)
│   │   ├── RouteEditor.jsx         (room route step editor)
│   │   ├── FeedbackDetail.jsx      (feedback detail view with status update)
│   │   └── QRDialog.jsx            (QR code generation dialog)
│   ├── overview/
│   │   ├── ActivityChart.jsx       (line chart with period toggle data)
│   │   ├── SatisfactionPanel.jsx   (rating bars and score)
│   │   ├── FeedbackFocusList.jsx   (attention-needed feedback items)
│   │   └── QuickActions.jsx        (quick action link list)
│   ├── feedback/
│   │   └── FeedbackTable.jsx       (shared feedback table used by overview and feedback page)
│   └── qr/
│       └── QRPattern.jsx           (SVG QR code renderer using qrCode utility)
```

### Page Modules

The page modules are:

- `portal/src/pages/LoginPage.jsx`: receives selected role, role setter, and login callback from `App.jsx`. Owns its local login form state (username, password, show/hide password, error message). Renders the story panel and login form.
- `portal/src/pages/OverviewPage.jsx`: receives role, navigate callback, visible feedback, open-feedback callback, and create callback. Owns chart period toggle state. Composes `MetricCard` grid, `ActivityChart`, `SatisfactionPanel`, `FeedbackFocusList`, `QuickActions`, and a compact `FeedbackTable`.
- `portal/src/pages/SubcitiesPage.jsx`: receives items, onAdd callback, search, and setSearch. Renders directory stats overview and data table with pagination.
- `portal/src/pages/AccountsPage.jsx`: receives items, onAdd, search, setSearch. Owns role filter state locally. Renders metrics and accounts table.
- `portal/src/pages/BureausPage.jsx`: receives items, onAdd, search, setSearch. Renders metrics and bureau table with completion bars.
- `portal/src/pages/ServicesPage.jsx`: receives items, onAdd, onEdit, search, setSearch, onTogglePublish. Owns service filter state locally. Renders intro block and service cards.
- `portal/src/pages/FeedbackPage.jsx`: receives items, onOpen, search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter. Renders metrics and `FeedbackTable`.
- `portal/src/pages/NewsPage.jsx`: receives items, onAdd, search, setSearch, onTogglePublish. Owns type filter state locally. Renders feature banner and news list.
- `portal/src/pages/RoutesPage.jsx`: receives items, onEdit, search, setSearch. Renders route summary, toolbar, and route card grid with mini-route previews.
- `portal/src/pages/QRPage.jsx`: receives onGenerate, onCopy callbacks. Owns copied-link state. Composes `QRPattern`, stats, and instructions.
- `portal/src/pages/OfficePage.jsx`: standalone, no props. Renders office profile card.
- `portal/src/pages/ActivityPage.jsx`: standalone, no props. Owns the activity events data. Renders timeline.

### Shared Layout Components

`portal/src/components/layout/`:

- `Sidebar.jsx`: receives role, activePage, setActivePage, onLogout, mobileOpen, setMobileOpen. Renders brand, workspace badge, nav groups with badges, help card, and profile row.
- `Topbar.jsx`: receives role, onMenu, onLogout. Owns notifications-open and profile-open popover state locally. Renders breadcrumb, demo badge, notification and profile popovers.

### Shared UI Components

`portal/src/components/ui/`:

- `Icon.jsx`: the `Icon` function component with its full SVG paths dictionary. Receives `name`, `size`, `strokeWidth`.
- `Brand.jsx`: the `Brand` lockup component. Receives `compact` boolean.
- `SearchBox.jsx`: search input with icon and clear button. Receives `value`, `onChange`, `placeholder`.
- `StatusPill.jsx`: status pill with dot. Receives `children`.
- `TypePill.jsx`: feedback type pill. Receives `type`.
- `MetricCard.jsx`: metric card with icon, value, label, note, trend, tone. Receives all as props.
- `PageHeading.jsx`: page heading with eyebrow, title, subtitle, primary action, secondary action. Receives corresponding props.

### Modal Components

`portal/src/components/modals/`:

- `Modal.jsx`: overlay shell. Receives `modal` config object and `onClose`. Dispatches to the correct modal body by `modal.kind`.
- `ModalForm.jsx`: dynamic form renderer. Receives `modal` config (fields, title, description, submit) and `onClose`. Owns form values state.
- `RouteEditor.jsx`: room-by-room step editor. Receives `route`, `onClose`, `onSave`. Owns editable steps state.
- `FeedbackDetail.jsx`: feedback item detail with status update. Receives `item`, `onClose`, `onUpdate`. Owns status state.
- `QRDialog.jsx`: QR code preview dialog. Receives `onClose`, `onGenerate`.

### Overview Sub-components

`portal/src/components/overview/`:

- `ActivityChart.jsx`: line chart with summary and period-dependent data. Receives `period`.
- `SatisfactionPanel.jsx`: satisfaction score, stars, and rating distribution bars. Receives `onNavigate` callback.
- `FeedbackFocusList.jsx`: attention-needed feedback list. Receives `items` and `onFeedback` callback.
- `QuickActions.jsx`: quick action button list. Receives `items` and `onNavigate` callback.

### Feedback Sub-component

`portal/src/components/feedback/`:

- `FeedbackTable.jsx`: reusable table used by both `OverviewPage` (compact mode) and `FeedbackPage` (full mode). Receives `items`, `onOpen`, `compact`.

### QR Sub-component

`portal/src/components/qr/`:

- `QRPattern.jsx`: SVG QR code rendering component. Receives `data` string. Uses `feedbackQrMatrix` from `utils/qrCode.js`.

### Data Module

`portal/src/data/portalData.js`:

- Exports `ROLE`, `NAV`, `INITIAL_SUBCITIES`, `INITIAL_BUREAUS`, `INITIAL_ACCOUNTS`, `INITIAL_SERVICES`, `INITIAL_ROUTES`, `INITIAL_FEEDBACK`, `INITIAL_POSTS`.
- All current values remain unchanged.

### Utility Module

`portal/src/utils/qrCode.js`:

- Exports `feedbackQrMatrix(text)` which produces the QR code boolean matrix.
- Contains `qrGfMultiply` and `qrErrorCorrection` as internal helpers.

## State Ownership

- **App.jsx** owns: `role`, `session`, `activePage`, `mobileOpen`, `modal`, `search`, `typeFilter`, `statusFilter`, and data collection state (`subcities`, `bureaus`, `accounts`, `services`, `routes`, `feedback`, `posts`, `copiedLink`). It also owns the `resetSearch`, `navigate`, `signInDemo`, `signOut`, `openForm`, `openFeedback`, `createForPage`, `onUpdateService`, and `visibleFeedback` memo.
- **LoginPage** owns: `username`, `password`, `showPassword`, `error`.
- **OverviewPage** owns: `period` (chart period toggle).
- **AccountsPage** owns: `roleFilter`.
- **ServicesPage** owns: `serviceFilter`.
- **NewsPage** owns: `typeFilter` (local, separate from the feedback type filter in App).
- **Topbar** owns: `notificationsOpen`, `profileOpen`.
- **ModalForm** owns: `values`.
- **RouteEditor** owns: `steps` (editable copy).
- **FeedbackDetail** owns: `status`.
- **QRPage** owns: `copied`.

## Navigation and Styling

Page selection remains in `App.jsx` via the `activePage` string and role-conditional rendering. The sidebar, topbar, and footer callbacks continue to reference `App.jsx` handlers. Existing CSS class names, IDs, and wrapper structure remain unchanged. Components retain the class names required by `App.css`. The existing stylesheet file remains in place and is not modified during this refactor.

## Review Focus

- Selecting each demo role still shows the correct nav items, dashboard metrics, and data-filtered views.
- Navigating between pages resets search/filters correctly.
- The login form, demo role selector, and sign-out flow work identically.
- Creating entities via modal forms correctly appends to the right data collection.
- The feedback detail modal correctly updates feedback status across both overview and inbox views.
- Editing a route in the route editor saves steps back to the routes collection.
- The QR code renders correctly and the copy-link interaction works.
- All service publish toggles, news publish toggles, and form validations remain functional.
- Existing CSS selectors still match after extraction.

## Implementation Decisions

- Preserve existing behavior and avoid introducing new dependencies.
- Keep the current `App.css` stylesheet file and all class names.
- Put local state as close as practical to the page or component that uses it.
- Mirror the client app's folder structure pattern: `components/{domain}/`, `pages/`, `data/`, `utils/`.
- The builder may settle exact import grouping or minor prop naming as implementation details, as long as the boundaries above remain clear.
