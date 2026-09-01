# Architecture

## Overview
```text
data/book.ts (Book/Chapter data) -> utils/pagination.ts (fitting engine) -> components/Book.tsx (reader) -> app/ (routing)
```
A Next.js (App Router) / React app. No backend, no database. Content is hardcoded TypeScript today (per-book files planned); `localStorage` holds preferences and reading position.

## Major Components
- **Content data** (`data/book.ts` / per-book files) — `Book`/`Chapter` shape, markdown-authored text or pre-converted page images.
- **Pagination engine** (`utils/pagination.ts`) — turns chapter markdown into discrete, page-sized chunks.
- **Reader** (`components/Book.tsx`) — renders the current spread/page, drives the flip animation, owns `pagesPerView`/`layoutVersion`.
- **Routing** (`app/`) — shelf at `/`, reader at `/[bookSlug]/[chapterSlug]`, 404 fallback.
- **Settings/preferences** — font size, theme, single/two-page toggle, saved position; persisted to `localStorage`.

## Component Responsibilities
### Content data
Defines what a book/chapter contains. Text-type books store markdown in `Chapter.fullText`; pages-type books (PDF/image-only) store an ordered list of image URLs, no chapters. Both types share `slug`/`id` fields and a `startsWithBlankPage` flag.

### Pagination engine
For text-type books only. Measures actual rendered DOM height (via a hidden measurement clone) to binary-search how much markdown-parsed content fits per page. Generates pages lazily and incrementally — it cannot compute page N without generating pages 0..N-1 first, since page boundaries depend on real rendered size, not just character count. Pages-type books skip this entirely — their page count is just the array length.

### Reader
Owns the currently-displayed spread/page, the flip animation, and `pagesPerView` (1 when mobile or the single-page preference is on, 2 otherwise). Renders parsed markdown (`dangerouslySetInnerHTML`, sanitized) for text pages, or a `next/image` for pages-type content.

### Routing
Maps URLs to book/chapter slugs. A book-only URL (`/[bookSlug]`) redirects to the first or saved chapter. An unknown slug renders the 404 page.

## Communication
```text
data/book.ts -> utils/pagination.ts (text books only) -> components/Book.tsx
app/[bookSlug]/[chapterSlug]/page.tsx -> components/Book.tsx (which book/chapter to show)
components/Book.tsx <-> localStorage (preferences, reading position)
```

## Data Flow
See [Data Flow](Data%20Flow.md) for the detailed flows (markdown-to-page, PDF-to-page, deep-link positioning).

## External Services
None currently. PDF-to-image conversion is a manual/offline authoring-time step, not a runtime service call.

## Security Considerations
- **Data protection:** parsed markdown HTML is sanitized (e.g. DOMPurify) before `dangerouslySetInnerHTML`, even though current content is fully trusted — defensive ahead of any future less-trusted content source.
- **Authentication / Authorization:** not applicable — no accounts, no user-specific data beyond local, per-browser preferences.
- **Other:** no server-side content ever executes user input; all content is either hardcoded or statically imported.

## Design Decisions
See the [ADR folder](../5%20-%20Project%20Maintenance/ADR/) for the reasoning behind each of these:
- [ADR-001](../5%20-%20Project%20Maintenance/ADR/ADR-001-custom-css-page-turn-animation.md) — Custom CSS 3D transforms for the page-turn animation, not `react-pageflip`.
- [ADR-002](../5%20-%20Project%20Maintenance/ADR/ADR-002-marked-not-react-markdown.md) — `marked` (HTML string, shared between measurement and display), not `react-markdown`.
- [ADR-003](../5%20-%20Project%20Maintenance/ADR/ADR-003-motion-for-shelf-transition.md) — Motion for the shelf-opening transition, not the native View Transitions API or GSAP.
- [ADR-004](../5%20-%20Project%20Maintenance/ADR/ADR-004-pdf-prerendered-to-images.md) — PDF pre-rendered to images at import time, not live `pdf.js` rendering.
- [ADR-005](../5%20-%20Project%20Maintenance/ADR/ADR-005-whole-book-content-typing.md) — Whole-book content typing (`text` vs. `pages`), not mixed-chapter books.
- [ADR-006](../5%20-%20Project%20Maintenance/ADR/ADR-006-explicit-slug-fields.md) — Chapter/book `slug` fields set explicitly, not derived live from titles.

## Known Limitations
- The pagination engine cannot jump directly to an arbitrary page — deep-linking to a late chapter means generating everything before it first, in-browser.
- No automated test suite.
- No deployment target yet.
- Font size, theme, and the page-count toggle are global preferences (not per-book); only reading position is per-book.

## Future Considerations
- If content-authoring ergonomics (a future, deferred sub-project) moves to a markdown-file loader or CMS, sanitization already exists to support less-trusted content.
- If the pagination engine's "can't jump to a page" limitation becomes a real problem (e.g. very long books), revisit whether some form of precomputed/cached pagination makes sense — noted as a real trade-off against the engine's deliberate viewport-responsiveness.
