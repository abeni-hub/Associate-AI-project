# Client App Componentization Design

## Intent

Restructure the CivicLink client into clear page modules and focused section components. The current `client/src/App.jsx` combines hash routing, the shared site shell, home-page state, translation data, service data, and the markup for seven home-page sections. The goal is to make each page and each substantial page section easier to understand and maintain while keeping the existing app experience intact.

## Goals

- Keep the three user-facing page views in `client/src/pages`: `HomePage`, `NewsEventsPage`, and `ItemDetailPage`.
- Keep `App.jsx` responsible for app-wide language state, hash route selection, shared metadata, and rendering the common shell.
- Move home-only state and behavior into `HomePage` or the section component that owns it.
- Extract each substantial page section into a focused component grouped by its owning page.
- Preserve existing hash URLs, page content, visual class names, translations, and user interactions.
- Reuse the existing React/Vite setup without adding dependencies.

## Non-goals

- Redesign the screens or change page copy.
- Introduce a routing library or change route formats.
- Change the news service, API behavior, or data model.
- Split or rewrite the existing stylesheet system as part of this refactor.

## Constraints and Existing State

- The client is a React 19/Vite app with hash-based navigation implemented in `App.jsx`.
- The existing news and detail pages already live in `client/src/pages/` and are rendered inside the shared shell.
- The current `App.jsx` contains the home-page translation dictionary, service catalog, icon helpers, carousel, and home page sections.
- The working tree already contains user edits in `client/src/App.jsx`, `client/src/App.css`, `client/src/pages/NewsEventsPage.jsx`, and `client/src/styles/newsEvents.css`. Those edits must remain intact, including the active navigation class update, Amharic styling, and news page content/styling changes.
- Keep current DOM IDs and CSS class names so existing navigation, layout, and styles continue to work.

## Approaches Considered

1. **Extract JSX while leaving state in `App.jsx`.** This would shorten the render block, but the root component would still own home-only form, search, and carousel behavior. It does not fully address the current overload.
2. **Separate pages and assign state to its owning page or section.** `App.jsx` keeps routing and shared state; `HomePage` owns the service finder and home composition; the feedback form owns its wizard state; reusable shell and home sections move into focused components. This aligns with the requested pages and section-level decomposition and is the selected approach.
3. **Replace hash routing and introduce a new app architecture.** This could provide a broader foundation, but it adds dependencies and changes navigation behavior without being needed for the requested refactor.

## Selected Architecture

`App.jsx` remains the single app entry component. It owns language persistence, document metadata, the current hash-derived view, news filter tab, detail item ID, and route/navigation callbacks. It renders `AnnouncementBar`, `SiteHeader`, the active page, and `SiteFooter` within the existing `.site-shell` wrapper.

The page modules are:

- `client/src/pages/HomePage.jsx`: composes the home sections and owns home-level service finder state, selected guide state, and hero carousel timing.
- `client/src/pages/NewsEventsPage.jsx`: retains its existing feed/filter behavior.
- `client/src/pages/ItemDetailPage.jsx`: retains its existing item, RSVP, and related-content behavior.

The shared shell components live under `client/src/components/layout/`: `AnnouncementBar`, `SiteHeader`, and `SiteFooter`. `SiteHeader` owns its mobile menu open state and receives callbacks for navigation. `Icon` and `BrandMark` move to shared UI components under `client/src/components/ui/`.

Home page components live under `client/src/components/homepage/`:

- `HeroSection` and `HeroBureauCarousel`
- `QuickSearchSection`
- `ServiceGuideSection`
- `JourneySection` and `JourneyCard`
- `HomeNewsSection` and `HomeNewsEvents`, split into controls, a grid, and news/event cards
- `FeedbackSection` and `FeedbackFormCard`, with focused step-content, actions, and success components
- `AdminStrip`

The interactive feedback wizard state stays with `FeedbackFormCard`, since it is only used by that form. Its parent section handles the surrounding copy and layout. Existing sections keep their IDs, classes, and behavior.

News page components live under `client/src/components/news-events/`:

- `NewsEventsHero`
- `NewsEventsFilterToolbar`, which groups type tabs, search, sub-city selection, category chips, and reset behavior
- `NewsEventsFeed`, which composes the feed metadata, results, and feed state
- `NewsEventCard` for the shared news/event card frame and type-specific content
- `NewsEventsFeedStates` for empty, loading, sentinel, and end-of-feed presentations
- `FloatingBackToTop`

The existing `NewsEventsPage` retains filtering, fetching, pagination, and observer state, and composes these page components.

Detail page components live under `client/src/components/item-detail/`:

- `DetailBreadcrumbs`
- `DetailHeader`
- `DetailHeroMedia`
- `EventSpecsCard` and `EventRsvpForm`
- `DetailArticleContent`
- `DetailRelatedItems`
- `DetailLoading` and `DetailNotFound`
- `DetailPageFooter`

The existing `ItemDetailPage` retains item loading, copy-link, and RSVP state, and composes these components. Its page footer remains in place in addition to the shared app footer, matching the current rendered output.

Move the home translation dictionary/helper into `client/src/i18n/translations.js`, and home-only service, bureau, sub-city, and hero-slide data into `client/src/data/homePageData.js`. Move the page-specific `HomeNewsEvents` component into the homepage component folder and keep its data-loading state there while its controls and cards live in focused components beside it. Keep the current news category and sub-city data in a page-scoped module. All current labels and values remain unchanged.

## Navigation and Styling

The shared header, announcement link, footer links, home page buttons, and news/detail callbacks continue to use callbacks from `App.jsx`. Cross-page links to home anchors first select the home view, then scroll to the same IDs as today. The hash routes remain `#/`, `#/news-events`, `#/news`, `#/events`, `#/news/:id`, and `#/event/:id`.

Existing stylesheets remain in place. Components retain the current class names, IDs, and wrapper structure required by `App.css` and `styles/newsEvents.css`. User-edited styling and page content remain untouched except where JSX has to move with its owning component. The current detail view contains a page-local footer as well as the app-level footer; both remain during this behavior-preserving refactor.

## Review Focus

- Directly loading each supported hash still selects the same view and tab.
- Navigating from news or detail back to a home anchor selects the home page and scrolls to that section.
- Switching language updates all three pages, document metadata, and persisted preference as before.
- Changing bureau or service still updates the guide and feedback form choices correctly.
- The feedback wizard retains its step transitions, rating requirement, submission state, and reset behavior.
- Existing CSS selectors still match after extraction, and the pre-existing user edits remain present.

## Implementation Decisions

- Preserve existing behavior and avoid introducing new dependencies.
- Keep the current stylesheet files and class names.
- Put local state as close as practical to the page or component that uses it.
- Keep `NewsEventsPage` and `ItemDetailPage` filenames to avoid unnecessary renames; they are already the app's news and detail page modules.
- The builder may settle exact helper file names or prop grouping as implementation details, as long as the boundaries above remain clear.
