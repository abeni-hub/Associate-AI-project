# Portal Redesign: Flexible Offices, Landing Page CMS, and Custom Roles & Permissions

## Intent

Evolve the CivicLink Admin Portal from flat mock lists into a robust, hierarchical governance platform matching the government client's database ERD and operational workflows:
1. **Flexible Office Hierarchy:** Replace rigid, separate Sub-cities and Bureaus schemas with dynamic `office_types` and a self-referencing `offices` tree (`belongs_to_office`), allowing arbitrary administrative levels (e.g. Regional Office → Sub-city → Bureau → Woreda Desk).
2. **Landing Page CMS:** Provide Super Admins with a dedicated content management console (`LandingPageCms.jsx`) to control public announcements, hero slides, journey steps, and quick search categories rendered on the citizen-facing client app.
3. **Custom Roles & Permissions:** Establish an access control studio (`RolesPermissionsPage.jsx`) where Super Admins can configure granular module-by-module permissions, create custom roles, and enforce least-privilege security.

## Goals

- **Schema Alignment:** Model data structures after the provided relational database ERD: `office_types`, `offices`, `users`, `services`, `service_documents`, `service_steps`, `news`, `events`, `feedback`, `qr_codes`.
- **Unified Offices Console (`OfficesPage.jsx`):** Provide a tree-aware, filterable directory showing office types, parent-child relationships, administrator assignments, readiness scores, and lifecycle statuses.
- **Client Landing Page CMS (`LandingPageCms.jsx`):** Allow real-time editing of the citizen app's announcement banner, hero slides, journey steps, and featured spotlights, complete with an interactive live preview card.
- **Roles & Permissions Studio (`RolesPermissionsPage.jsx`):** Offer an interactive matrix of permissions across system modules (*Offices, Services, Routes, Feedback, News/Events, Landing Page CMS, Accounts & Roles*) with toggleable capabilities (*View, Create, Edit, Delete, Publish*).
- **Design Excellence:** Deliver state-of-the-art UI adhering to CivicLink's visual design system (CSS tokens, glassmorphism, `--teal`, `--gold`, `--sage`, refined typography, and Emil Kowalski micro-interactions).
- **Non-destructive Integration:** Seamlessly preserve existing route navigation, modal orchestration, and responsive layouts established during componentization.

## Non-goals

- Implementing server-side SQL database engines (PostgreSQL/MySQL) in this step (this design implements the client-side state model, seed records, and schemas mirroring the ERD for immediate interaction and future API binding).
- Modifying the citizen `client/` package directly during this task (the portal CMS will manage the standardized CMS schema that exports/syncs with `client/src/data/homePageData.js`).

## Constraints & Existing State

- The portal runs on React 19 and Vite 8, styled via `portal/src/App.css`.
- The portal has been cleanly componentized into `pages/`, `components/layout/`, `components/ui/`, `components/modals/`, `components/overview/`, `components/feedback/`, `components/qr/`, `data/portalData.js`, and `utils/qrCode.js`.
- All CSS class names and existing styles must be preserved or thoughtfully extended using standard CSS variables (`--ink`, `--teal`, `--sage`, `--gold`, `--border`, `--surface`).

## Approaches Considered

1. **Approach A: Unified Hierarchical Architecture & Dedicated Admin Consoles (Selected)**
   - Unifies Sub-cities and Bureaus into a recursive `OfficesPage.jsx` with office-type badges and parent-lineage navigation.
   - Introduces dedicated `LandingPageCms.jsx` with interactive live preview.
   - Introduces `RolesPermissionsPage.jsx` with interactive capabilities matrix.
   - Seamlessly maps to the client ERD while elevating visual design.

2. **Approach B: Additive Tabs within Existing Pages**
   - Keeps `SubcitiesPage` and `BureausPage` separate, adding an extra tab for "Office Types".
   - Embeds CMS fields into a multi-step modal form without preview.
   - Embeds permissions into a collapsible panel on `AccountsPage`.
   - *Why rejected:* Fails to represent the recursive parent-office relationship and feels cluttered.

---

## Detailed Design & Architecture

### 1. Database Schema & Data Models (`portal/src/data/portalData.js`)

#### A. Office Types & Offices
```javascript
export const INITIAL_OFFICE_TYPES = [
  { id: 1, name: 'Sub-city', description: 'Municipal sub-city administrative center', level: 1 },
  { id: 2, name: 'Bureau', description: 'Specialized public service bureau or agency', level: 2 },
  { id: 3, name: 'Woreda Office', description: 'Local community administrative branch', level: 3 },
  { id: 4, name: 'Service Center', description: 'Walk-in civic service desk or satellite branch', level: 4 }
]

export const INITIAL_OFFICES = [
  { id: 1, typeId: 1, name: 'Lemi Kura', parentId: null, admin: 'Aster Bekele', services: 32, completion: 88, status: 'Active', updated: 'Today' },
  { id: 2, typeId: 1, name: 'Bole', parentId: null, admin: 'Henok Girma', services: 41, completion: 92, status: 'Active', updated: 'Yesterday' },
  { id: 3, typeId: 1, name: 'Yeka', parentId: null, admin: 'Mimi Tesfaye', services: 27, completion: 84, status: 'Active', updated: 'Oct 20, 2026' },
  { id: 4, typeId: 2, name: 'Revenues Bureau', parentId: 1, admin: 'Dawit Alemu', services: 8, completion: 92, status: 'Active', updated: 'Today' },
  { id: 5, typeId: 2, name: 'Civil Registration Office', parentId: 1, admin: 'Meseret Hailu', services: 12, completion: 84, status: 'Active', updated: 'Oct 19, 2026' },
  { id: 6, typeId: 2, name: 'Land Administration', parentId: 1, admin: 'Tewodros Kassa', services: 6, completion: 68, status: 'Needs attention', updated: 'Oct 18, 2026' },
  { id: 7, typeId: 3, name: 'Woreda 04 Service Desk', parentId: 4, admin: 'Selamawit Abate', services: 4, completion: 75, status: 'Active', updated: 'Oct 15, 2026' }
]
```

#### B. Roles & Custom Permissions Matrix
```javascript
export const INITIAL_ROLES = [
  {
    id: 'super',
    name: 'Super Admin',
    description: 'Full platform administration across all organizations, offices, and CMS',
    scope: 'Platform',
    userCount: 3,
    isSystem: true,
    permissions: {
      offices: ['view', 'create', 'edit', 'delete'],
      accounts: ['view', 'create', 'edit', 'delete'],
      services: ['view', 'create', 'edit', 'delete', 'publish'],
      routes: ['view', 'edit'],
      feedback: ['view', 'status_update', 'assign'],
      news: ['view', 'create', 'edit', 'delete', 'publish'],
      cms: ['view', 'edit', 'publish'],
      roles: ['view', 'create', 'edit']
    }
  },
  {
    id: 'subcity',
    name: 'Sub-City Admin',
    description: 'Manages bureaus, services, and communication within their assigned sub-city',
    scope: 'Sub-city',
    userCount: 11,
    isSystem: true,
    permissions: {
      offices: ['view', 'create', 'edit'],
      accounts: ['view', 'create'],
      services: ['view', 'create', 'edit', 'publish'],
      routes: ['view'],
      feedback: ['view', 'status_update'],
      news: ['view', 'create', 'edit', 'publish'],
      cms: [],
      roles: ['view']
    }
  },
  {
    id: 'bureau',
    name: 'Bureau Admin',
    description: 'Configures step-by-step room routes, QR codes, and resolves local feedback',
    scope: 'Bureau',
    userCount: 86,
    isSystem: true,
    permissions: {
      offices: ['view'],
      accounts: [],
      services: ['view'],
      routes: ['view', 'edit'],
      feedback: ['view', 'status_update'],
      news: [],
      cms: [],
      roles: []
    }
  },
  {
    id: 'content_editor',
    name: 'Public Communications Editor',
    description: 'Specialized role for editing landing page announcements, news updates, and public notices',
    scope: 'Platform',
    userCount: 2,
    isSystem: false,
    permissions: {
      offices: ['view'],
      accounts: [],
      services: ['view'],
      routes: [],
      feedback: ['view'],
      news: ['view', 'create', 'edit', 'publish'],
      cms: ['view', 'edit', 'publish'],
      roles: []
    }
  }
]
```

#### C. Landing Page CMS State
```javascript
export const INITIAL_CMS_CONFIG = {
  announcement: {
    enabled: true,
    tag: 'PUBLIC NOTICE',
    message: 'All Sub-City Service Desks will open at 8:30 AM during public holidays.',
    linkText: 'Check holiday desk hours',
    linkUrl: '#/news-events'
  },
  hero: {
    badge: 'FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA',
    titleEn: 'Every public service visit. Clear from the start.',
    titleAm: 'ግልጽና ፈጣን የመንግስት አገልግሎቶች ለህዝባችን',
    subtitleEn: 'Find required documents, step-by-step room routes, and official bureau hours before you visit your sub-city office.',
    subtitleAm: 'አስፈላጊ ሰነዶች፣ ደረጃ በደረጃ የክፍል መመሪያዎችና ትክክለኛ መረጃዎች በአንድ ቦታ።',
    slides: [
      { id: 1, title: 'Trade & Business Licensing', bureau: 'Revenues Bureau · Lemi Kura', image: 'trade' },
      { id: 2, title: 'Civil Status & Birth Certificate', bureau: 'Civil Registration · Bole', image: 'civil' },
      { id: 3, title: 'Landholding Corrections', bureau: 'Land Administration · Yeka', image: 'land' }
    ]
  },
  journey: {
    title: 'The Citizen Journey',
    steps: [
      { step: '01', title: 'Before the visit', detail: 'Check prerequisites, required documents, and service fee.' },
      { step: '02', title: 'At the office', detail: 'Follow room-to-room navigation without confusion or delay.' },
      { step: '03', title: 'After the visit', detail: 'Scan the bureau QR code to submit satisfaction or feedback.' }
    ]
  },
  stats: [
    { label: 'Sub-cities Connected', value: '11' },
    { label: 'Bureaus Registered', value: '86' },
    { label: 'Published Services', value: '248' },
    { label: 'Citizen Satisfaction', value: '94%' }
  ]
}
```

---

### 2. Page & Component Structure

#### Page 1: `portal/src/pages/OfficesPage.jsx` (Replaces separate SubcitiesPage & BureausPage)
- **Top Metrics:** Total Offices, Sub-cities, Bureaus/Agencies, Avg Readiness.
- **Filter Bar:** Office Type Pills (`All`, `Sub-cities`, `Bureaus`, `Woreda Offices`), Parent Office selector, and Search Input.
- **Table / Tree Representation:**
  - Column 1: Office Name with Office Type badge and Parent Lineage chip (e.g. `↳ Lemi Kura`).
  - Column 2: Office Type (`Sub-city`, `Bureau`, etc.).
  - Column 3: Assigned Administrator.
  - Column 4: Service Guides count.
  - Column 5: Guide Completion progress bar.
  - Column 6: Status pill (`Active`, `Setup`, `Needs attention`).
  - Actions: Edit Office, Manage Routes, Manage Users.
- **Modal:** `OfficeModal.jsx` to create or edit any office type, dynamically selecting its parent office and assigning an administrator.

#### Page 2: `portal/src/pages/LandingPageCms.jsx` (New Super Admin Console)
- **Header:** Eyebrow `CITIZEN EXPERIENCE CMS`, Title `Landing Page Content`, Action `Publish Changes` (with last published timestamp).
- **Split Layout:**
  - **Left (Editor Panel):**
    - Section Tabs: `Announcement Banner` | `Hero & Slides` | `Citizen Journey` | `Highlights & Stats`.
    - Form inputs with real-time state updates, bilingual English/Amharic fields, toggle switches, and slide reordering.
  - **Right (Live Client Preview):**
    - High-fidelity preview container with device frame switcher (Desktop / Mobile).
    - Accurately renders the announcement bar, hero typography, glowing pill badges, and step cards as they will appear to citizens.

#### Page 3: `portal/src/pages/RolesPermissionsPage.jsx` (New Access Control Studio)
- **Header:** Eyebrow `SECURITY & ACCESS CONTROL`, Title `Roles & Permissions`, Action `Create Custom Role`.
- **Role Selector Carousel / Cards:**
  - Displays each role with user count badge, scope tag, and system/custom pill.
- **Interactive Capabilities Matrix:**
  - Rows: *Offices & Hierarchy, Service Standards, Room Routes, Citizen Feedback, News & Events, Landing Page CMS, Accounts & Roles*.
  - Columns: *View, Create, Edit, Delete, Publish*.
  - Interactive switches: Green checkmark pills for granted permissions; clickable toggles for custom roles.
- **Assigned Users Drawer / Sub-panel:**
  - Quick glance of administrators currently assigned to the active role.

---

### 3. Layout and Navigation Integration

Update `portal/src/components/layout/Sidebar.jsx` and `portal/src/data/portalData.js`:
- **Super Admin Navigation Groups:**
  - *Platform Directory:* `overview` (Overview), `offices` (Offices & Directory), `accounts` (Accounts), `roles` (Roles & Permissions).
  - *Public Experience:* `cms` (Landing Page CMS), `news` (News & Events).
  - *Citizen Voice:* `feedback` (Citizen Feedback), `activity` (Activity Log).
- **Sub-City Admin Navigation:**
  - *Workspace:* `overview`, `offices` (scoped to their sub-city bureaus), `services` (Service Standards).
  - *Community:* `feedback`, `news`.
- **Bureau Admin Navigation:**
  - *Workspace:* `overview`, `routes` (Room Routes), `feedback`.
  - *Office Tools:* `qr` (Feedback QR Codes), `office` (Office Profile).

---

## Visual Design & Micro-interactions (Emil Kowalski Philosophy)

- **Color Tokens:** Rich dark theme with deep teal slate backgrounds (`#0a141a`, `#111f27`), luminous accents (`--teal: #367b7d`, `--sage: #528a74`, `--gold: #d4a359`), and crisp white text.
- **Elevation & Depth:** Dual-layer glassmorphism (`background: rgba(17, 31, 39, 0.75)`, subtle border strokes `rgba(255, 255, 255, 0.08)`, and backdrop blur).
- **Responsive Controls:** Custom toggle switches (`.switch-toggle`) that animate with spring-like cubic bezier transitions.
- **Live Preview Polish:** Miniature responsive iframe/card rendering the real citizen header and hero with genuine gradient lighting.

---

## Review Focus & Verification Criteria

1. **Role Access Verification:**
   - Logging in as `Super Admin` exposes `Offices`, `Roles & Permissions`, and `Landing Page CMS`.
   - Logging in as `Sub-city Admin` scopes the Offices view to bureaus in their sub-city.
   - Logging in as `Bureau Admin` keeps the focused Room Route and QR code tools.
2. **Office Hierarchy Workflow:**
   - Creating a new Bureau under `Lemi Kura` correctly establishes the parent link and reflects in the directory.
   - Filtering by "Sub-city" or "Bureau" filters the table accurately.
3. **Landing Page CMS Workflow:**
   - Editing announcement banner text or hero headlines immediately reflects in the split-screen live preview card.
   - Clicking "Publish changes" displays a confirmation notification and updates the mock client feed.
4. **Roles & Permissions Workflow:**
   - Creating a custom role (e.g. `Inspector`) allows toggling capabilities and persists in the role list.
5. **Code Quality & Build:**
   - `npm run build` succeeds with zero errors.
   - `npm run lint` (`oxlint`) passes with zero warnings or errors.
