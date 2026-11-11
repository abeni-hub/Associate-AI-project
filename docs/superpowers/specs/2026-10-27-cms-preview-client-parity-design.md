# CMS Preview Client Parity Design

## Intent

Make the portal's landing page CMS preview show the same content structure, visual styling, and responsive behavior as the citizen client landing page, while giving the preview more space. The preview should help Super Admins judge how editable CMS content will look in the actual client.

## Goals and non-goals

- Reuse the client landing page components and styles so the preview cannot drift as a separately maintained mockup.
- Keep the CMS editor and device switcher working; apply editable CMS values in the preview where they map to client sections.
- Widen the preview column on desktop while preserving a usable stacked layout at narrower widths.
- Keep the live client page's current default content and behavior. Do not add a statistics section to the client landing page or preview because no matching section exists in the client page.
- Server persistence and CMS-to-client publishing are outside this change.

## Approaches

1. **Render the actual client landing page in an isolated preview surface (recommended).** Reuse the client components and their CSS inside a frame so portal styles do not affect the page. Add optional CMS overrides only where needed. This keeps content and presentation tied to the client implementation.
2. **Tune the portal's copied preview markup and CSS.** This is smaller initially, but remains a duplicate and can diverge again; it does not reliably meet the exact-match goal.

Proceed with approach 1, assuming the user accepts the stated recommendation. Leave the existing stats editor data intact but do not render a stats strip in the preview.

## Constraints and implementation choices

- Preserve the existing portal redesign work and the CMS editor's current controls.
- Keep the client page's existing defaults unchanged when no CMS override is provided.
- Increase the preview share of the desktop CMS grid and retain its responsive collapse behavior.
- Use an isolated rendering surface for client styles to avoid global style collisions with the portal.

## Builder decisions

The builder should map the current CMS announcement, hero, slide, and journey fields onto the corresponding client components without changing the default client page. If a CMS field has no client-page counterpart, it should not add new page content solely to display that field.
