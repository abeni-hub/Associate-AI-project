# CMS Preview Client Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the CMS preview render the citizen app's actual landing page and give it a wider desktop column.

**Architecture:** Compose the preview from the client app's existing page components, adding optional CMS overrides that leave normal client defaults unchanged. Mount that composition in an iframe with the client's stylesheets so portal CSS remains isolated; retain the existing device controls around it.

**Tech Stack:** React 19, Vite 8, CSS.

**Spec:** `docs/superpowers/specs/2026-10-27-cms-preview-client-parity-design.md`

## Global Constraints

- Preserve the client page's current default content and behavior when no CMS override is provided.
- Keep the CMS editor and device switcher working.
- Apply CMS values in the preview where they map to client sections.
- Do not add a statistics section to the client landing page or preview.
- Keep the desktop CMS preview wider and preserve a usable stacked layout at narrower widths.
- Use the client page's own responsive breakpoints for both desktop and phone previews instead of bespoke replica-only responsive rules.
- Do not add or run automated tests unless requested.

## Review Focus

- No CMS override: the client landing page renders with its existing content and behavior. (Task 1)
- Edited announcement, hero, slides, and journey values reach their matching client sections. (Tasks 1–2)
- Empty or reduced slide lists do not leave the carousel index out of range. (Task 1)
- Client typography and styles remain isolated from portal styles. (Task 2)
- Desktop and phone preview frames keep content accessible through their own scroll area. (Tasks 2–3)

---

### Task 1: Compose a reusable client landing preview surface

**Files:**
- Create: `client/src/components/CmsLandingPreviewPage.jsx`
- Modify: `client/src/pages/HomePage.jsx`
- Modify: `client/src/components/layout/AnnouncementBar.jsx`
- Modify: `client/src/components/homepage/HeroSection.jsx`
- Modify: `client/src/components/homepage/HeroBureauCarousel.jsx`
- Modify: `client/src/components/homepage/JourneySection.jsx`
- Modify: `portal/src/data/portalData.js`

**Interfaces:**
- Produces `CmsLandingPreviewPage({ cmsConfig, documentRef })`, composed from the same announcement, header, home page, and footer components used by the client app.
- `HomePage` accepts optional `cmsConfig`; absent config preserves its current defaults.
- Components receiving CMS fields use optional props and retain current default output when those props are absent.

- [x] Add optional props to the client sections for CMS announcement, hero and slides, and journey content. Keep the existing static copy and current carousel behavior as the fallback; clamp the active slide when the configured slide count changes.
- [x] Compose `CmsLandingPreviewPage` from the existing client announcement, header, `HomePage`, and footer. Route in-page navigation through `documentRef` so links stay inside the preview frame.
- [x] Align the portal's initial CMS copy with the client landing page where fields represent the same visible content; keep the stats values out of the rendered page.

### Task 2: Render the client surface in an isolated portal frame

**Files:**
- Create: `portal/src/components/cms/ClientLandingPageFrame.jsx`
- Modify: `portal/src/components/cms/LiveLandingPreview.jsx`

**Interfaces:**
- `ClientLandingPageFrame({ cmsConfig, isMobile })` mounts `CmsLandingPreviewPage` inside an iframe, updates it when CMS state changes, and switches between a scaled desktop viewport and the phone's responsive viewport.
- Import the client styles as strings with Vite's `?inline` CSS query, then attach them to the iframe document in client stylesheet order.

- [x] Create and destroy the iframe React root with the frame lifecycle; include the client font links, `App.css`, `newsEvents.css`, and `index.css` in the iframe document.
- [x] Replace the independent replica markup with `ClientLandingPageFrame`; retain the portal toolbar, desktop/mobile switcher, and outer device frames.
- [x] Remove the obsolete `JourneyArtwork` and other replica-only rendering code from `LiveLandingPreview.jsx`.

### Task 3: Widen the preview and remove replica styles

**Files:**
- Modify: `portal/src/App.css`

- [x] Give the preview the larger desktop share of `.cms-studio-layout` and adjust the single-column breakpoint for the new minimum preview width.
- [x] Replace the `.replica-*` style block with iframe sizing, scrolling, and responsive frame rules; preserve existing portal toolbar and phone frame styling.

### Task 4: Remove the sidebar workspace block

**Files:**
- Modify: `portal/src/components/layout/Sidebar.jsx`
- Modify: `portal/src/App.css`

- [x] Remove the “YOUR WORKSPACE / CivicLink Ethiopia” card and its unused styles while preserving sidebar navigation and account controls.

No test files or test commands are included in this plan, per the workspace instruction.
