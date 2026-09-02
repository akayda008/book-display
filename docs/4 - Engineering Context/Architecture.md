# Architecture

## Overview
```text
data/book.ts (Book/Chapter data) -> utils/pagination.ts (fitting engine) -> components/Book.tsx (reader) -> app/ (routing)
```
A Next.js (App Router) / React app. No backend, no database. Content is hardcoded TypeScript today (per-book files planned); `localStorage` holds preferences and reading position.

## Major Components
- **Content data** (`data/book.ts` / per-book files) — `Book`/`Chapter` shape, markdown-authored text or pre-converted page images; a `books` library array plus `getBookBySlug`/`getChapterBySlug` lookups.
- **Pagination engine** (`utils/pagination.ts`) — turns chapter markdown into discrete, page-sized chunks.
- **Reader** (`components/Book.tsx`) — renders the current spread/page, drives the flip animation, owns `pagesPerView`/`layoutVersion`; accepts an optional `initialChapterId` to buffer forward to a deep-linked chapter.
- **Routing** (`app/`) — shelf at `/`, `/[bookSlug]` (redirects to the first chapter for text books, renders the reader directly for pages-type books), reader at `/[bookSlug]/[chapterSlug]`, 404 fallback.
- **Shelf transition** (`components/PageTransition.tsx`) — a context/provider (mounted in the root layout so it survives route changes) driving the generic "card grows into open book" Motion transition (ADR-003), plus its reverse via `components/BackToShelfLink.tsx`.
- **Settings/preferences** — font size, theme, single/two-page toggle, saved position; persisted to `localStorage` (Sub-project 5).

## Component Responsibilities
### Content data
Defines what a book/chapter contains, and the library of books routing/the shelf resolve against. Text-type books store markdown in `Chapter.fullText`; pages-type books (PDF/image-only) store an ordered list of image URLs, no chapters. Both types share hand-set `slug` fields (ADR-006, independent of the internal `id`) and a `startsWithBlankPage` flag. `validateLibrary` runs at module load and `console.warn`s on a duplicate book or (within one book) chapter slug — the same dev-time-warning spirit as the unclosed `:::` fence check in `utils/markdown.ts`.

### Pagination engine
For text-type books only. Measures actual rendered DOM height (via a hidden measurement clone) to binary-search how much markdown-parsed content fits per page. Generates pages lazily and incrementally — it cannot compute page N without generating pages 0..N-1 first, since page boundaries depend on real rendered size, not just character count. Pages-type books skip this entirely — their page count is just the array length.

### Reader
Owns the currently-displayed spread/page, the flip animation, and `pagesPerView` (1 when mobile or the single-page preference is on, 2 otherwise). Renders parsed markdown (`dangerouslySetInnerHTML`, sanitized) for text pages, or a `next/image` for pages-type content. When given `initialChapterId` (a chapter deep-link), it buffers pages sequentially from the book's start until that chapter's first page appears, then opens there instead of at page 0 — pagination still can't jump straight to a page (see Known Limitations), so the position lands on the nearest `pagesPerView` boundary rather than always guaranteeing the chapter starts on the recto (right-hand) page in two-page mode.

### Routing
Maps URLs to book/chapter slugs via `getBookBySlug`/`getChapterBySlug`. A book-only URL (`/[bookSlug]`) redirects to the first chapter for a text book; a pages-type book (no chapter concept) renders its reader directly at that same URL. An unknown book or chapter slug calls `notFound()` (standard 404).

## Communication
```text
data/book.ts -> utils/pagination.ts (text books only) -> components/Book.tsx
app/[bookSlug]/[chapterSlug]/page.tsx -> components/Book.tsx (which book/chapter to show)
app/page.tsx (shelf) <-> components/PageTransition.tsx (opening transition) -> router.push -> app/[bookSlug]/...
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
- The pagination engine cannot jump directly to an arbitrary page — deep-linking to a late chapter means generating everything before it first, in-browser. A related consequence: a deep-linked chapter isn't guaranteed to land on the recto (right-hand) page in two-page mode, the same way normal forward-flipping isn't either — no recto-forcing logic exists anywhere in the pagination engine today.
- The shelf-opening/closing transition is a generic full-screen cover/reveal (a plain rectangle growing from the clicked card, or shrinking back on the way out), not a true cross-route shared-element measurement of the actual reader frame — Next's App Router unmounts the previous route's tree on navigation, so there's no DOM element to measure a shared transition against on the far side.
- No automated test suite.
- No deployment target yet.
- Font size, theme, and the page-count toggle are global preferences (not per-book); only reading position is per-book.

## Future Considerations
- If content-authoring ergonomics (a future, deferred sub-project) moves to a markdown-file loader or CMS, sanitization already exists to support less-trusted content.
- If the pagination engine's "can't jump to a page" limitation becomes a real problem (e.g. very long books), revisit whether some form of precomputed/cached pagination makes sense — noted as a real trade-off against the engine's deliberate viewport-responsiveness.
