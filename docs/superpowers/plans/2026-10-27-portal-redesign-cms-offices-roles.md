# Portal Redesign (CMS, Flexible Offices & Custom Roles) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend redesign of the CivicLink Admin Portal with a flexible office hierarchy, a Super Admin Landing Page CMS with live preview, and an interactive Custom Roles & Permissions management studio, based strictly on the client ERD and Approach A without touching any backend servers.

**Architecture:** Frontend React 19 application. `portal/src/data/portalData.js` supplies relational mock data structures for `office_types`, hierarchical `offices`, granular `roles` permissions, and `cms` landing state. Three dedicated pages (`OfficesPage`, `LandingPageCms`, `RolesPermissionsPage`) with focused subcomponents handle user interactions. `App.jsx` and `Sidebar.jsx` coordinate role-based access and routing. `App.css` provides design-engineered visual polish with glassmorphic cards and micro-animations.

**Tech Stack:** React 19, Vite 8, JavaScript modules, Vanilla CSS with custom tokens.

**Spec:** `docs/superpowers/specs/2026-10-27-portal-redesign-cms-offices-roles-design.md`

## Global Constraints

- **Frontend Only:** Do not create or touch any backend server, API route, or database migration. All data is managed through React state and seed collections.
- **Design System Consistency:** Follow CivicLink's visual design tokens (`--ink`, `--teal`, `--gold`, `--sage`, glassmorphic surfaces, rounded status pills, and refined typography).
- **Zero Build/Lint Regressions:** Every task must pass `npm run build` and `npm run lint` (`oxlint`) cleanly with zero errors and zero warnings.
- **Non-destructive Migration:** Retain existing capabilities (Login, Overview, Accounts, Services, Routes, Feedback, News, QR, Office, Activity) while adding the new modules.

## Review Focus

- **Hierarchical Offices:** Creating or editing an office allows assigning any office type and selecting an eligible parent office without circular reference errors.
- **Office Scope Filtering:** Super Admins can see and filter all office types; Sub-city Admins see their own sub-city and its child bureaus.
- **CMS Real-Time Live Preview:** Editing announcement copy or hero headlines in `LandingPageCms` updates the interactive live preview card instantaneously without lag.
- **Permissions Matrix Interactivity:** Toggling capabilities on custom roles updates state immediately; system roles display read-only lock badges.
- **Role Switching & Navigation:** Switching between Super Admin, Sub-city Admin, and Bureau Admin correctly displays the appropriate sidebar groups and restricts access to unauthorized pages.

---

### Task 1: Expand Relational Schema & Mock Data in `portalData.js`

**Files:**
- Modify: `portal/src/data/portalData.js`
- Modify: `portal/src/components/ui/Icon.jsx`

**Interfaces:**
- `INITIAL_OFFICE_TYPES`: Array of `{ id, name, description, level }`.
- `INITIAL_OFFICES`: Array of `{ id, typeId, name, parentId, admin, services, completion, status, updated }`.
- `INITIAL_ROLES`: Array of `{ id, name, description, scope, userCount, isSystem, permissions }`.
- `INITIAL_CMS_CONFIG`: Object containing `{ announcement, hero, journey, stats }`.
- `NAV`: Updated navigation maps including `offices`, `cms`, and `roles`.
- `Icon`: Added icons: `sitemap`, `palette`, `key`, `desktop`, `mobile`, `check-circle`.

- [x] **Step 1: Add new icon paths to `portal/src/components/ui/Icon.jsx`** (`sitemap`, `palette`, `key`, `desktop`, `mobile`, `checkCircle`).
- [x] **Step 2: Add `INITIAL_OFFICE_TYPES`, `INITIAL_OFFICES`, `INITIAL_ROLES`, and `INITIAL_CMS_CONFIG` to `portal/src/data/portalData.js`**.
- [x] **Step 3: Update `NAV` definitions in `portalData.js`** to include `offices`, `cms`, and `roles` under Super Admin, and replace subcities/bureaus with `offices` under Sub-city Admin.
- [x] **Step 4: Run `npm run lint` in `portal/`.** Verify zero errors and zero warnings.

---

### Task 2: Build the Flexible Office Hierarchy Console (`OfficesPage.jsx` & `OfficeModal.jsx`)

**Files:**
- Create: `portal/src/components/offices/OfficeModal.jsx`
- Create: `portal/src/pages/OfficesPage.jsx`

**Interfaces:**
- `OfficeModal({ office, officeTypes, offices, isOpen, onClose, onSave })`: Modal dialog with inputs for office name, type selection (`typeId`), parent office selection (`parentId`), administrator name, and initial status.
- `OfficesPage({ offices, officeTypes, role, onAddOffice, onEditOffice, search, setSearch })`: Comprehensive directory displaying metrics, type filter chips, parent lineage chips, progress bars, and status pills.

- [x] **Step 1: Create `portal/src/components/offices/OfficeModal.jsx`** with dynamic parent office selection (preventing an office from being its own parent).
- [x] **Step 2: Create `portal/src/pages/OfficesPage.jsx`** composing page heading, top stat cards, search & type filters, table with lineage badges, and empty states.
- [x] **Step 3: Run `npm run lint` in `portal/`.** Verify clean syntax and exports.

---

### Task 3: Build the Landing Page CMS Studio (`LandingPageCms.jsx` & `LiveLandingPreview.jsx`)

**Files:**
- Create: `portal/src/components/cms/LiveLandingPreview.jsx`
- Create: `portal/src/pages/LandingPageCms.jsx`

**Interfaces:**
- `LiveLandingPreview({ config, previewDevice, onToggleDevice })`: Visual container simulating citizen client landing page with announcement bar, hero typography, glowing pills, and journey cards.
- `LandingPageCms({ cmsConfig, onSaveCms })`: Super Admin console with tabbed editing for Announcement, Hero, Journey, and Highlights, plus publish toast feedback.

- [x] **Step 1: Create `portal/src/components/cms/LiveLandingPreview.jsx`** with device switcher (Desktop vs Mobile) and citizen styling.
- [x] **Step 2: Create `portal/src/pages/LandingPageCms.jsx`** with tabs (`Announcement`, `Hero & Slides`, `Citizen Journey`, `Highlights & Stats`), input forms, and split-screen preview.
- [x] **Step 3: Run `npm run lint` in `portal/`.** Verify clean syntax and prop types.

---

### Task 4: Build Custom Roles & Permissions Studio (`RolesPermissionsPage.jsx` & `RoleModal.jsx`)

**Files:**
- Create: `portal/src/components/roles/RoleModal.jsx`
- Create: `portal/src/pages/RolesPermissionsPage.jsx`

**Interfaces:**
- `RoleModal({ isOpen, onClose, onSave })`: Dialog to create a custom administrative role with name, scope (`Platform` | `Sub-city` | `Bureau`), and description.
- `RolesPermissionsPage({ roles, onUpdateRolePermissions, onCreateRole })`: Interactive studio with role selector cards, permissions matrix table, interactive switches for custom roles, and read-only lock badges for system roles.

- [x] **Step 1: Create `portal/src/components/roles/RoleModal.jsx`** for custom role creation.
- [x] **Step 2: Create `portal/src/pages/RolesPermissionsPage.jsx`** with role selector cards and the interactive capability matrix (Rows: Modules, Columns: View/Create/Edit/Delete/Publish).
- [x] **Step 3: Run `npm run lint` in `portal/`.** Verify clean syntax.

---

### Task 5: Style Integration, Navigation & Coordinator Assembly (`App.jsx`, `Sidebar.jsx`, `App.css`)

**Files:**
- Modify: `portal/src/App.css`
- Modify: `portal/src/components/layout/Sidebar.jsx`
- Modify: `portal/src/App.jsx`

**Interfaces:**
- `App.jsx` manages `offices`, `officeTypes`, `roles`, and `cmsConfig` states, with handlers `onAddOffice`, `onSaveCms`, `onUpdateRolePermissions`, `onCreateRole`.
- `Sidebar.jsx` renders updated navigation items with new icons (`sitemap`, `palette`, `key`).

- [x] **Step 1: Add CSS styles in `portal/src/App.css`** for office lineage chips, CMS editor split layout, preview card, and permissions matrix table.
- [x] **Step 2: Update `portal/src/components/layout/Sidebar.jsx`** to support the new nav icons and labels.
- [x] **Step 3: Refactor `portal/src/App.jsx`** to wire new page routes (`offices`, `cms`, `roles`), new state collections, and modal flows.
- [x] **Step 4: Run `npm run lint` and `npm run build` in `portal/`.**
- [x] **Step 5: Verify in browser** that all 3 roles navigate properly, office creation works, CMS editing updates live preview, and role permissions toggle interactively.

---

## Final Review

- Confirm zero backend code was touched.
- Confirm full compliance with the database ERD and workflows.
- Confirm aesthetic excellence across all new pages.
