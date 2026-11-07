# Portal App Componentization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the monolithic CivicLink portal admin app (`portal/src/App.jsx`, 589 lines) into 12 focused page modules, shared layout components, UI components, modal components, overview sub-components, data module, and QR utility without altering existing behavior, styles, or visual presentation.

**Architecture:** `App.jsx` owns role-based routing, authentication session, global data collections, active search/filter states, and modal orchestration. Each of the 12 pages (`LoginPage`, `OverviewPage`, `SubcitiesPage`, `AccountsPage`, `BureausPage`, `ServicesPage`, `FeedbackPage`, `NewsPage`, `RoutesPage`, `QRPage`, `OfficePage`, `ActivityPage`) lives in `portal/src/pages/` and manages page-scoped state. Shared layout, UI, modals, overview widgets, QR, and feedback table components reside in `portal/src/components/`. All static seed constants reside in `portal/src/data/portalData.js`, and QR algorithms reside in `portal/src/utils/qrCode.js`.

**Tech Stack:** React 19, Vite 8, JavaScript modules, CSS (`App.css`).

**Spec:** `docs/superpowers/specs/2026-10-26-portal-app-componentization-design.md`

## Global Constraints

- Preserve all existing CSS class names, IDs, visual styles, DOM hierarchy, and interactive behavior.
- Retain the current `App.css` file without modifications.
- Maintain identical data models, mock seed constants, and modal form definitions.
- Keep local state as close as possible to the component or page that uses it.
- Ensure `npm run build` and `npm run lint` pass cleanly with zero errors.

## Review Focus

- Role switching and login/logout work seamlessly across `super`, `subcity`, and `bureau` accounts.
- Navigation among all admin pages updates the view and resets relevant search/filter state as expected.
- Modals (entity creation form, route editor, feedback status updater, QR preview) function identically.
- Tables, pagination, completion bars, service publish toggles, and news publish toggles behave as before.
- SVG QR code renders cleanly and link copying continues to work.
- Existing CSS selectors still match and zero styling regressions occur.

---

### Task 1: Extract Shared UI, Layout, Data, Utils, Modals, and Widgets

**Files:**
- Create: `portal/src/data/portalData.js`
- Create: `portal/src/utils/qrCode.js`
- Create: `portal/src/components/ui/Icon.jsx`
- Create: `portal/src/components/ui/Brand.jsx`
- Create: `portal/src/components/ui/SearchBox.jsx`
- Create: `portal/src/components/ui/StatusPill.jsx`
- Create: `portal/src/components/ui/TypePill.jsx`
- Create: `portal/src/components/ui/MetricCard.jsx`
- Create: `portal/src/components/ui/PageHeading.jsx`
- Create: `portal/src/components/layout/Sidebar.jsx`
- Create: `portal/src/components/layout/Topbar.jsx`
- Create: `portal/src/components/modals/Modal.jsx`
- Create: `portal/src/components/modals/ModalForm.jsx`
- Create: `portal/src/components/modals/RouteEditor.jsx`
- Create: `portal/src/components/modals/FeedbackDetail.jsx`
- Create: `portal/src/components/modals/QRDialog.jsx`
- Create: `portal/src/components/qr/QRPattern.jsx`
- Create: `portal/src/components/feedback/FeedbackTable.jsx`
- Create: `portal/src/components/overview/ActivityChart.jsx`
- Create: `portal/src/components/overview/SatisfactionPanel.jsx`
- Create: `portal/src/components/overview/FeedbackFocusList.jsx`
- Create: `portal/src/components/overview/QuickActions.jsx`

- [x] **Step 1: Extract `portalData.js` and `qrCode.js`** without altering data structures or Reed-Solomon math.
- [x] **Step 2: Extract shared UI components** (`Icon`, `Brand`, `SearchBox`, `StatusPill`, `TypePill`, `MetricCard`, `PageHeading`).
- [x] **Step 3: Extract layout components** (`Sidebar`, `Topbar`) preserving menu toggles and popovers.
- [x] **Step 4: Extract modals** (`Modal`, `ModalForm`, `RouteEditor`, `FeedbackDetail`, `QRDialog`) with local form states.
- [x] **Step 5: Extract overview and shared components** (`QRPattern`, `FeedbackTable`, `ActivityChart`, `SatisfactionPanel`, `FeedbackFocusList`, `QuickActions`).
- [ ] **Step 6: Verify linting on extracted foundational components.** Ensure no unused variables or syntax issues.

### Task 2: Extract Auth & Admin Shell Pages

**Files:**
- Create: `portal/src/pages/LoginPage.jsx`
- Create: `portal/src/pages/OverviewPage.jsx`
- Create: `portal/src/pages/OfficePage.jsx`
- Create: `portal/src/pages/ActivityPage.jsx`

**Interfaces:**
- `LoginPage({ selectedRole, setSelectedRole, onLogin })`: Owns local username, password, showPassword, and error state.
- `OverviewPage({ role, onNavigate, feedback, onFeedback, onCreate })`: Owns local period state ('week' | 'month' | 'quarter'). Composes metric cards, `ActivityChart`, `SatisfactionPanel`, `FeedbackFocusList`, `QuickActions`, and compact `FeedbackTable`.
- `OfficePage()`: Standalone office profile card.
- `ActivityPage()`: Standalone timeline of administrative events.

- [ ] **Step 1: Extract `LoginPage.jsx`** preserving demo role selection and credentials verification.
- [ ] **Step 2: Extract `OverviewPage.jsx`** composing all dashboard widgets and the compact feedback table.
- [ ] **Step 3: Extract `OfficePage.jsx` and `ActivityPage.jsx`** preserving static office info and activity timeline.
- [ ] **Step 4: Run `npm run lint` from `portal/`.** Verify clean syntax across extracted shell pages.

### Task 3: Extract Directory & Operations Pages

**Files:**
- Create: `portal/src/pages/SubcitiesPage.jsx`
- Create: `portal/src/pages/AccountsPage.jsx`
- Create: `portal/src/pages/BureausPage.jsx`
- Create: `portal/src/pages/ServicesPage.jsx`

**Interfaces:**
- `SubcitiesPage({ items, onAdd, search, setSearch })`: Directory metrics, search box, and sub-city administration table.
- `AccountsPage({ items, onAdd, search, setSearch })`: Owns local `roleFilter` ('All' | 'Sub-city' | 'Bureau'). Metrics, filter buttons, search, and accounts table.
- `BureausPage({ items, onAdd, search, setSearch })`: Metrics, completion progress bars, and bureau table.
- `ServicesPage({ items, onAdd, onEdit, search, setSearch, onTogglePublish })`: Owns local `serviceFilter`. Service cards grid with document requirements, publish toggles, and edit actions.

- [ ] **Step 1: Extract `SubcitiesPage.jsx`** with table and directory summary.
- [ ] **Step 2: Extract `AccountsPage.jsx`** with role filter pills and accounts table.
- [ ] **Step 3: Extract `BureausPage.jsx`** with completion bars and metrics.
- [ ] **Step 4: Extract `ServicesPage.jsx`** with category filters and service cards.
- [ ] **Step 5: Run `npm run lint` from `portal/`.** Verify all extracted directory pages.

### Task 4: Extract Feedback, News, Routes, and QR Pages

**Files:**
- Create: `portal/src/pages/FeedbackPage.jsx`
- Create: `portal/src/pages/NewsPage.jsx`
- Create: `portal/src/pages/RoutesPage.jsx`
- Create: `portal/src/pages/QRPage.jsx`

**Interfaces:**
- `FeedbackPage({ items, onOpen, search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter })`: Full feedback inbox with type pills, status filters, search, and full `FeedbackTable`.
- `NewsPage({ items, onAdd, search, setSearch, onTogglePublish })`: Owns local `typeFilter` ('All' | 'News' | 'Event'). Feature banner, news/event card list with publish toggles.
- `RoutesPage({ items, onEdit, search, setSearch })`: Room routes grid with mini route step previews and edit button.
- `QRPage({ onGenerate, onCopy })`: Owns local `copied` toast state. Displays `QRPattern`, QR stats, print/download/copy actions, and deployment steps.

- [ ] **Step 1: Extract `FeedbackPage.jsx`** with filter toolbar, metrics, and `FeedbackTable`.
- [ ] **Step 2: Extract `NewsPage.jsx`** with banner, filter tabs, and publication toggles.
- [ ] **Step 3: Extract `RoutesPage.jsx`** with room step previews.
- [ ] **Step 4: Extract `QRPage.jsx`** with QR renderer and copy action.
- [ ] **Step 5: Run `npm run lint` from `portal/`.** Verify clean syntax across extracted pages.

### Task 5: Refactor `App.jsx` and Perform Full Verification

**Files:**
- Modify: `portal/src/App.jsx`
- Modify: `portal/src/components/ui/Brand.jsx` (remove unused Icon import)

- [ ] **Step 1: Refactor `App.jsx`** to import all pages, layout, data, and modal components. Keep session, role, activePage routing, CRUD data state, and modal management.
- [ ] **Step 2: Clean up any lint warnings** (e.g. unused imports in `Brand.jsx`).
- [ ] **Step 3: Run `npm run build` and `npm run lint` from `portal/`.**
- [ ] **Step 4: Test in browser** to verify role switching, modal actions, search/filtering, and responsive layout.

## Final Review

- Confirm `portal/src/App.jsx` is slimmed down from 589 lines to a clean root coordinator.
- Confirm all 12 pages and components preserve existing styles and CSS selectors.
- Verify zero runtime console errors and zero build/lint regressions.
