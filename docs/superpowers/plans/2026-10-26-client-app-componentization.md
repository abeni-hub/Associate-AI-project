# Client App Componentization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the CivicLink client into three page modules, shared shell components, and page-scoped section components without changing current behavior or presentation.

**Architecture:** `App.jsx` owns app-wide routing, language, metadata, and the shared shell. `HomePage`, `NewsEventsPage`, and `ItemDetailPage` own their respective page composition and local behavior, with substantial sections extracted beneath page-specific component folders. Shared UI, shell, translation, and home data modules are separate.

**Tech Stack:** React 19, Vite 8, JavaScript modules, CSS.

**Spec:** `docs/superpowers/specs/2026-10-26-client-app-componentization-design.md`

## Global Constraints

- Preserve existing hash URLs, page content, visual class names, translations, and user interactions.
- Keep the current stylesheet files and class names.
- Reuse the existing React/Vite setup without adding dependencies.
- The working tree already contains user edits in `client/src/App.jsx`, `client/src/App.css`, `client/src/pages/NewsEventsPage.jsx`, and `client/src/styles/newsEvents.css`; those edits must remain intact.
- Keep current DOM IDs and CSS class names so existing navigation, layout, and styles continue to work.
- Preserve both the page-local detail footer and the app-level footer because both currently render on the detail view.

## Review Focus

- Directly loading each supported hash still selects the same view and tab. Check `#/`, `#/news-events`, `#/news`, `#/events`, `#/news/:id`, and `#/event/:id` after Task 1 and Task 4.
- Navigating from news or detail back to a home anchor selects the home page and scrolls to that section. Check the header, announcement, footer, and detail breadcrumbs after Task 1 and Task 4.
- Switching language updates all three pages, document metadata, and persisted preference as before. Check the shell, homepage, news page, and detail page after their respective tasks.
- Changing bureau or service still updates the guide and feedback form choices correctly. Check the home quick search, guide, and feedback form after Task 2.
- The feedback wizard retains its step transitions, rating requirement, submission state, and reset behavior. Check each form state after Task 2.
- News filtering, loading, empty, sentinel, and end-of-feed states continue to render and respond correctly. Check after Task 3.
- Item loading, not-found, copy-link, event RSVP, related-item navigation, and both current footers remain intact. Check after Task 4.
- Existing CSS selectors still match after extraction, and the pre-existing user edits remain present. Check the extracted section wrappers and compare the final diff after each task.

---

### Task 1: Extract Shared Shell, UI, Translation, and Home Data

**Files:**
- Create: `client/src/components/ui/Icon.jsx`
- Create: `client/src/components/ui/BrandMark.jsx`
- Create: `client/src/components/layout/AnnouncementBar.jsx`
- Create: `client/src/components/layout/SiteHeader.jsx`
- Create: `client/src/components/layout/SiteFooter.jsx`
- Create: `client/src/i18n/translations.js`
- Create: `client/src/data/homePageData.js`
- Modify: `client/src/App.jsx`

**Interfaces:**
- `Icon({ name, size = 20, strokeWidth = 1.8, className = '' })` preserves the current icon-path behavior.
- `BrandMark()` preserves the current logo markup.
- `AnnouncementBar({ t, onNavigateToHomeSection })` renders the existing top banner and calls the callback for its guide link.
- `SiteHeader({ currentView, language, t, onNavigateToHome, onNavigateToHomeSection, onNavigateToNews, onToggleLanguage })` renders the current header; it owns mobile menu state.
- `SiteFooter({ t, onNavigateToHomeSection })` renders the current app footer.
- `translate(text, language)` and `amharicCopy` preserve existing translations.
- `homePageData.js` exports `subCityOptions`, `bureauOptions`, `serviceCatalog`, `serviceFor`, and `heroSlides` with their existing values.

- [x] **Step 1: Extract the icon and brand helpers** into the shared UI files and import them in `App.jsx`.
- [x] **Step 2: Extract translation and home data modules** without changing any keys or values, then import them in `App.jsx`.
- [x] **Step 3: Extract the announcement bar, header, and app footer** with the interfaces above; retain current IDs, classes, links, and the user's active-nav class behavior.
- [x] **Step 4: Wire shell navigation callbacks in `App.jsx`** so cross-page home anchors still select the home view before scrolling.
- [x] **Step 5: Run `npm run build -- --outDir /tmp/civiclink-client-build` and `npm run lint` from `client/`.** Resolve only regressions introduced by this extraction and preserve existing user changes.

### Task 2: Create the Homepage and Its Section Components

**Files:**
- Create: `client/src/pages/HomePage.jsx`
- Create: `client/src/components/homepage/HeroSection.jsx`
- Create: `client/src/components/homepage/HeroBureauCarousel.jsx`
- Create: `client/src/components/homepage/QuickSearchSection.jsx`
- Create: `client/src/components/homepage/ServiceGuideSection.jsx`
- Create: `client/src/components/homepage/JourneySection.jsx`
- Create: `client/src/components/homepage/JourneyCard.jsx`
- Create: `client/src/components/homepage/HomeNewsSection.jsx`
- Create: `client/src/components/homepage/HomeNewsEvents.jsx` (move from `client/src/components/HomeNewsEvents.jsx`)
- Create: `client/src/components/homepage/HomeNewsControls.jsx`
- Create: `client/src/components/homepage/HomeNewsGrid.jsx`
- Create: `client/src/components/homepage/HomeNewsArticleCard.jsx`
- Create: `client/src/components/homepage/HomeNewsEventCard.jsx`
- Create: `client/src/components/homepage/homeNewsFormatting.js`
- Create: `client/src/components/homepage/FeedbackSection.jsx`
- Create: `client/src/components/homepage/FeedbackFormCard.jsx`
- Create: `client/src/components/homepage/FeedbackStepContent.jsx`
- Create: `client/src/components/homepage/FeedbackFormActions.jsx`
- Create: `client/src/components/homepage/FeedbackSuccess.jsx`
- Create: `client/src/components/homepage/AdminStrip.jsx`
- Modify: `client/src/App.jsx`
- Delete after moving: `client/src/components/HomeNewsEvents.jsx`

**Interfaces:**
- `HomePage({ language, t, onNavigateToHub, onSelectItem })` composes the homepage and owns service selection, selected guide, and carousel timing state.
- Each section component receives only the state and callbacks its section uses, plus `t` and `language` where needed.
- `FeedbackFormCard({ t })` owns the five-step wizard state and submission behavior; its smaller step, actions, and success components own only their display responsibilities.
- `HomeNewsEvents({ language, onNavigateToHub, onSelectItem })` preserves its existing public interface and data loading.

- [x] **Step 1: Move the existing `HomeNewsEvents` component** into `components/homepage/HomeNewsEvents.jsx` and update its imports without changing its behavior.
- [x] **Step 2: Extract hero and quick-search sections** with their existing class names, anchors, state updates, and carousel controls.
- [x] **Step 3: Extract service guide and journey sections** into focused components while retaining the current IDs and links.
- [x] **Step 4: Extract the news section and admin strip** into their page-scoped components.
- [x] **Step 5: Extract feedback copy and form**; keep wizard state inside `FeedbackFormCard` and preserve validation, step flow, success, and reset behavior.
- [x] **Step 6: Compose the new `HomePage` and render it from `App.jsx`** for the home route; remove only the extracted homepage state and JSX from `App.jsx`.
- [x] **Step 7: Run `npm run build -- --outDir /tmp/civiclink-client-build` and `npm run lint` from `client/`.** Resolve only regressions introduced by this extraction.

### Task 3: Extract News and Events Page Sections

**Files:**
- Create: `client/src/components/news-events/NewsEventsHero.jsx`
- Create: `client/src/components/news-events/NewsEventsFilterToolbar.jsx`
- Create: `client/src/components/news-events/NewsEventsFeed.jsx`
- Create: `client/src/components/news-events/NewsEventCard.jsx`
- Create: `client/src/components/news-events/NewsEventsFeedStates.jsx`
- Create: `client/src/components/news-events/FloatingBackToTop.jsx`
- Create: `client/src/components/news-events/newsEventsOptions.js`
- Modify: `client/src/pages/NewsEventsPage.jsx`

**Interfaces:**
- `NewsEventsPage` retains filter state, data fetching, infinite-scroll pagination, and observer lifecycle.
- `NewsEventsHero({ language })` renders the existing page hero, including the user's kicker addition.
- `NewsEventsFilterToolbar({ language, activeType, setActiveType, searchQuery, setSearchQuery, selectedSubCity, setSelectedSubCity, selectedCategory, setSelectedCategory, onReset })` renders the existing filter controls.
- `NewsEventsFeed({ language, items, totalCount, loading, hasMore, sentinelRef, onNavigateToDetail, onResetFilters })` composes feed metadata, empty state, cards, loading state, sentinel, and end state.
- `NewsEventCard({ item, language, onOpen })` renders a news or event card with the current fallbacks and keyboard navigation.

- [x] **Step 1: Extract the hero and filter toolbar** into `components/news-events/`, preserving the user's hero kicker and current controls.
- [x] **Step 2: Extract news/event cards** and preserve their image fallbacks, click behavior, and Enter-key behavior.
- [x] **Step 3: Extract feed empty/loading/end states and the floating back-to-top control**, preserving the current sentinel copy and observer ref.
- [x] **Step 4: Compose those sections from `NewsEventsPage.jsx`** while retaining all fetch, debounce, filter, and pagination logic in the page.
- [x] **Step 5: Run `npm run build -- --outDir /tmp/civiclink-client-build` and `npm run lint` from `client/`.** Resolve only regressions introduced by this extraction and preserve the user's news page edits.

### Task 4: Extract Detail Page Sections and Finish App Composition

**Files:**
- Create: `client/src/components/item-detail/DetailBreadcrumbs.jsx`
- Create: `client/src/components/item-detail/DetailHeader.jsx`
- Create: `client/src/components/item-detail/DetailHeroMedia.jsx`
- Create: `client/src/components/item-detail/EventSpecsCard.jsx`
- Create: `client/src/components/item-detail/EventRsvpForm.jsx`
- Create: `client/src/components/item-detail/DetailArticleContent.jsx`
- Create: `client/src/components/item-detail/DetailRelatedItems.jsx`
- Create: `client/src/components/item-detail/DetailLoading.jsx`
- Create: `client/src/components/item-detail/DetailNotFound.jsx`
- Create: `client/src/components/item-detail/DetailPageFooter.jsx`
- Create: `client/src/components/item-detail/detailDateFormatting.js`
- Modify: `client/src/pages/ItemDetailPage.jsx`
- Modify if required: `client/src/App.jsx`

**Interfaces:**
- `ItemDetailPage` retains item fetch, loading, copy-link, RSVP submission, and related-item selection state.
- Detail display components receive the item and preselected localized values or `language`, plus only the callbacks/state needed for their controls.
- `EventSpecsCard` composes event details with `EventRsvpForm`; news items do not render either event-only section.
- `DetailPageFooter({ isAm, onBackToHome, onBackToHub })` retains the current page-local footer markup.

- [x] **Step 1: Extract loading/not-found, breadcrumbs, header, and hero media** without changing their current markup or callbacks.
- [x] **Step 2: Extract event specs and RSVP form** while keeping RSVP state and submission in `ItemDetailPage`.
- [x] **Step 3: Extract article content and related items**, preserving tags, verification callout, and detail navigation behavior.
- [x] **Step 4: Extract the page-local detail footer** and confirm the shared app footer remains rendered as it is today.
- [x] **Step 5: Compose the components from `ItemDetailPage.jsx`**, retaining loading, copy-link, RSVP, and related-item state in the page.
- [x] **Step 6: Run `npm run build -- --outDir /tmp/civiclink-client-build` and `npm run lint` from `client/`.** Resolve only regressions introduced by this extraction.

## Final Review

- Review the full diff against the approved design and ensure there are no visual, route, translation, or behavior changes.
- Confirm the pre-existing edits remain in the final working tree.
- Inspect the page component sizes and boundaries; move any still-overloaded section markup into a page-scoped child component where it improves clarity.
- Run `npm run build -- --outDir /tmp/civiclink-client-build` and `npm run lint` from `client/` once more and report their actual results.
