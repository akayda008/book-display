# Roadmap

## Current Version

- Version: v0 (pre-release)
- Status: all 5 originally planned sub-projects complete (feature-complete for Planning Cycle 1) — no release process or deployment target exists yet
- Released on: not yet released

## Current Phase

Implementing the sub-projects designed in Planning Cycle 1, in dependency order (see Important Constraints in Project Overview for why order matters here — several sub-projects touch the same core files).

**Branch restructuring (see Development Workflow):** the repo's former `main` branch (all commit history through "Some changes") is renamed to `develop` — this is where all sub-project work happens from now on. A new `main` branch is created from the very first commit (`ad533e3`, "Initial Set-up") and is reserved for production only, updated by a deliberate merge from `develop` once work is actually complete — not during active development.

## Current Milestone

None — all five originally planned sub-projects (Planning Cycle 1) are complete. The next milestone starts with a fresh planning cycle (see `project-kickoff`) to decide what v0.1 (or beyond) actually covers, rather than continuing this Roadmap's dependency-ordered list.

## Upcoming Milestones

None currently — see Future Ideas below for what a future planning cycle could draw from.

## Future Ideas

Deferred, not rejected — may or may not get picked up later:

- Drag-to-turn page gesture (fast-follow to the click-triggered animation)
- Illustrated/animated shelf artwork, and the literal "grab the spine and pull it out" gesture (the generic card-grows-into-book transition is the placeholder until this exists)
- Shelf card visual design (currently text-only, deliberately left open)
- Table of contents, in-book search, bookmarks
- Content-authoring ergonomics: a markdown-file loader, and only if truly warranted, a headless CMS
- Inline images mixed into flowing text — currently believed unnecessary now that PDF/image-only pages and markdown text cover the format space between them; revisit only if a real case emerges that neither covers
- Live (drag-to-resize) repagination — resizing the reader window shows the reflowed layout continuously as you drag, rather than only after you release. Needs its own scoping/brainstorm pass, not a quick add: the pagination engine is sequential/stateful (can't jump to an arbitrary page, only regenerate forward from a chapter boundary), continuous resize events would need either debouncing (defeating the point) or a per-frame DOM-measurement fitting pass (a real performance question), and what (if anything) renders live mid-drag vs. only on release is a genuine UX decision.

## Completed Milestones

### Sub-project 5: Reading preferences (2026-09-03)

Added a settings panel (font size, theme, single/two-page toggle), saved reading position, and fixed the pre-existing resize/repagination position-loss bug — the last of the five originally planned sub-projects.

- [x] Settings panel in the reader, reachable at every viewport width: font size (fixed steps: Small/Medium/Large), light/dark theme (app chrome only, ADR-008 — book page stays amber in both themes), single/two-page toggle (only the toggle control itself is hidden on true mobile, since it'd be inert there)
- [x] All three preferences persist to global `localStorage` keys, degrading silently to in-memory defaults if storage is unavailable
- [x] Saved reading position: current chapter written to a per-book `localStorage` key on every chapter change; opening a book from the shelf resumes at the saved chapter via a client-side redirect (localStorage isn't visible server-side), or the first chapter if none saved
- [x] Fixed the resize/repagination position-loss bug: repagination now re-anchors to the chapter actually being read (tracked in a ref, reusing the chapter-detection logic from the recent URL-tracking bug fix) on every run after the initial mount, instead of snapping back to the route's original chapter
- [x] Font-size changes trigger the same repagination/re-anchor path as a resize
- [x] Chrome color palette reworked to Tailwind's warm `stone` neutrals with a muted `amber` accent, replacing the original cool-gray defaults, at the user's explicit request and full creative discretion — the book page itself stays untouched (unchanged amber paper, both themes)
- [x] Settings panel closes on an outside click/tap or Escape, not just by re-clicking the gear icon

Design changes made during manual verification, beyond the original scope:
- The frame's shape (not just page count) now follows the effective single/two-page view, not just the raw mobile/desktop breakpoint — checking the single-page toggle on desktop switches to the genuinely mobile-shaped (taller) frame, not the desktop-shaped frame with one slot hidden.
- The settings panel itself is reachable on mobile after all — the original brief over-broadly hid the whole panel there; Design Direction's actual rule only hides the single/two-page toggle specifically, since font size and theme remain meaningful on mobile.

Corrective testing fixed one real bug (logged in `MISTAKES.md`): the single/two-page toggle was only wired into page-count/advance logic, not into any of the other places `Book.tsx` decided one-page-vs-two (which column is hidden, which flip animation plays, the spine gutter) — those all still checked the raw `isMobile` flag directly, so the toggle silently had almost no visible effect beyond removing the leading blank page.

### Sub-project 4: Library/shelf view (2026-09-02)

Added a real multi-book library and routing: explicit hand-set `slug` fields on `Book`/`Chapter` (ADR-006, separate from `id`), a books registry with lookups and a dev-time duplicate-slug validator, a shelf page listing all books, and `/[bookSlug]/[chapterSlug]` reader routes (`/[bookSlug]` redirects to the first chapter for text books, or renders directly for the chapterless pages-type book). Unknown slugs 404. The Sub-project 3 `pagesTestBook` fixture is now a real permanent second book ("Sketchbook Pages").

- [x] `slug` fields on `Book`/`Chapter` (ADR-006), dev-time duplicate-slug validation
- [x] Shelf page (`/`) from a real multi-book list
- [x] `/[bookSlug]/[chapterSlug]` routing; `/[bookSlug]` redirects appropriately per content type
- [x] Unknown book/chapter slug → standard 404
- [x] Motion-based (ADR-003) generic "card grows into book" shelf-to-reader transition, reversed by a persistent back-to-shelf link; respects `prefers-reduced-motion`
- [x] Retired the Sub-project 3 temporary `/?pages=1` switch

Also added, beyond the original scope, as real gaps found during manual verification: the URL now tracks the current chapter via `router.replace` as the reader pages across a chapter boundary (history-only, no re-fetch or transition replay).

Corrective testing fixed two real bugs (logged in `MISTAKES.md`): the shelf-to-reader transition originally animated `width`/`height`/`top`/`left` instead of `transform`, causing visible jank; and a leftover Sub-project 3 counter-margin was unconditionally canceling the spine-side gutter for image-kind pages, misaligning "Sketchbook Pages"' two-page view relative to how text pages already gutter.

The transition itself is left as a generic cover/reveal rather than a true shared-element morph (Next.js unmounts the shelf route on navigation) — the user found it acceptable but not fully satisfying even after the smoothness fix, and explicitly deferred further polish; logged as low-priority technical debt, to revisit alongside the illustrated shelf-art gesture (see Technical Debts.md, Future Ideas).

### Sub-project 3: PDF import / image-only pages (2026-09-02)

Introduced the unified `pages`-type content model: `Book.content` is now `{type: 'text', chapters}` | `{type: 'pages', pages, startsWithBlankPage}` (ADR-004/ADR-005). Pages-type books skip the pagination engine entirely and render via `next/image`, letterboxed inside the existing fixed-aspect-ratio book frame; the existing flip/hinge animation, buttons, and reduced-motion handling are reused unchanged (the reader's internal `Page` type is now a text/image/blank discriminated union).

- [x] `content` type union on `Book` (ADR-005)
- [x] `next/image` (fill + object-fit: contain) rendering for pages-type content, no pagination/fitting involvement
- [x] Page-turn animation reused unchanged for pages-type content
- [x] "Page unavailable" placeholder for a broken/missing page image
- [x] Desktop two-page spread / mobile-tablet single-page rules apply the same way to pages-type books
- [x] Temporary pages-type test fixture (`public/books/test-pages/`, reachable via `/?pages=1`) — marked TEMPORARY, to be removed once Sub-project 4's routing lands

Corrective testing surfaced a real cross-cutting layout bug not scoped to this milestone's own new code (logged in `MISTAKES.md`): several page-frame styles (padding, text size, spacing, spine gutter) were still driven by Tailwind's own 768px/1024px breakpoints, left over from before Sub-project 2 moved the real single/two-page cutoff to a JS-driven 1200px — so single-page view had three inconsistent visual sub-ranges instead of one, affecting text pages as well as image pages. A first corrective pass fixed only the image-page symptom; the second pass found and fixed the actual cause, consolidating to one breakpoint-independent style gated by the same `isMobile` flag the reader already uses.

### Sub-project 2: Page-turn animation (2026-09-02)

Added click-triggered CSS 3D page-turn animation: desktop two-page spine-flip and mobile/tablet single-page spine-hinge flip, with buffered page generation, `prefers-reduced-motion` support, and inert buttons during an in-progress animation.

- [x] Desktop two-page spine-flip mechanic, non-overlapping advance-by-2 (1-2, 3-4, 5-6, ...)
- [x] Mobile/tablet single-page spine-hinge flip (Next hinges/reveals from the left edge; Previous uses its own distinct animation arriving from the left, rather than a reversed Next)
- [x] Always-buffered page generation (no mid-flip content wait)
- [x] `prefers-reduced-motion` support (instant swap, no animation)
- [x] Inert Previous/Next buttons during an in-progress animation
- [x] Fixed the book frame's medium-viewport (768px-1200px) gap and the stacked mobile Previous/Next buttons (both carried over from Sub-project 1, see Technical Debts.md)

Design changes made during manual verification, beyond the original scope:
- Moved the single-page/two-page breakpoint from 768px to 1200px, so tablet-sized viewports get the single-page view rather than the two-page spread.
- Moved Previous/Next to sit centered under the book instead of flanking it left/right.
- Reworked frame sizing to scale to fill available viewport space (width and height budgets together) instead of a fixed/capped size, fixing both the desktop-oversized-empty-space and mobile-edge-to-edge issues, and fixing centering at wide viewports.

Corrective testing rounds surfaced and fixed two real pre-existing-shape bugs (logged in `MISTAKES.md`): an off-by-one in the buffer-sufficiency check that let an animation start before its target page was actually buffered (visible as a blank page after a mobile flip), and a mismatched back-face content formula on the desktop leaf's Previous direction (visible as a flash of wrong content right as a Previous flip landed).

### Sub-project 1: Rich text formatting (2026-09-01)

Rewrote the pagination engine to parse and fit markdown content (bold/italic, one sub-heading level, lists, blockquotes, alignment, poem-line indentation) instead of plain text.

- [x] Add `marked` and wire it into a shared parse step (HTML string used for both the measurement clone and the visible page)
- [x] Add the custom `|` line-block pre/post-processing pass for poem indentation
- [x] Add the custom `::: center` / `::: right` / `::: left` / `::: justify` fenced-block pass for alignment
- [x] Make the word-level binary-search splitter format-aware (never cuts inside a bold/italic span)
- [x] Make headings/list-items/blockquote-lines atomic units (fit whole or move to the next page)
- [x] Add DOMPurify sanitization before `dangerouslySetInnerHTML`
- [x] Add dev-time validation for unclosed `:::` fences
- [x] Migrate the 12 existing chapters' raw 4-space poem indentation to the new `|` marker convention
- [x] Verify all 12 existing chapters render identically to before

Also fixed a real pre-existing pagination measurement bug found during manual testing (not originally scoped, folded in since it undermined this milestone's own correctness bar): the invisible measurement clone used a different internal layout structure, and a different width at desktop (up to ~2x too wide), than the real rendered page — so the fitting algorithm accepted more content than actually fit, silently clipping it. Fixed across several corrective rounds by making the measurement clone structurally identical to the real page (down to matching a 1px border), verified to a true 0px width/height difference at both desktop and mobile.

Two purely cosmetic, pre-existing layout issues were found during the same testing pass and deferred to Sub-project 2 rather than fixed here (logged in Technical Debts.md): a black gap in the book frame at medium viewport widths (768px-1200px), and the Previous/Next buttons stacking vertically instead of sitting in one row on mobile.

Three temporary chapters remain in `data/book.ts`, kept deliberately as living regression coverage for the markdown/pagination pipeline (this project has no automated test suite).
