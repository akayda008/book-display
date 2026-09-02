# Roadmap

## Current Version

- Version: v0 (pre-release)
- Status: implementation in progress — Sub-project 1 of 5 complete
- Released on: not yet released

## Current Phase

Implementing the sub-projects designed in Planning Cycle 1, in dependency order (see Important Constraints in Project Overview for why order matters here — several sub-projects touch the same core files).

**Branch restructuring (see Development Workflow):** the repo's former `main` branch (all commit history through "Some changes") is renamed to `develop` — this is where all sub-project work happens from now on. A new `main` branch is created from the very first commit (`ad533e3`, "Initial Set-up") and is reserved for production only, updated by a deliberate merge from `develop` once work is actually complete — not during active development.

## Current Milestone

### Goal

Sub-project 2: Page-turn animation (click-triggered, custom CSS 3D transforms).

### Planned Work

- Desktop two-page spine-flip mechanic (advance-by-2, front/back page reveal)
- Mobile single-page 360° spin mechanic (advance-by-1)
- Always-buffered page generation (no mid-flip content wait)
- `prefers-reduced-motion` support
- Inert buttons during an in-progress animation
- Fold in the two deferred layout fixes from Sub-project 1 (see Technical Debts.md): the book frame's medium-viewport (768px-1200px) gap, and the stacked Previous/Next buttons on mobile — both land naturally here since this milestone already reworks the frame's layout/geometry.

## Upcoming Milestones

- Sub-project 3: PDF import / image-only pages (unified `pages`-type content model, pre-rendered images, reuses the page-turn animation unchanged)
- Sub-project 4: Library/shelf view (`/[bookSlug]/[chapterSlug]` routing, explicit `slug` fields, Motion-based opening/closing transition)
- Sub-project 5: Reading preferences (font size, app-chrome-only theme, saved reading position, single/two-page toggle) — includes fixing the pre-existing resize/repagination position-loss bug

## Future Ideas

Deferred, not rejected — may or may not get picked up later:

- Drag-to-turn page gesture (fast-follow to the click-triggered animation)
- Illustrated/animated shelf artwork, and the literal "grab the spine and pull it out" gesture (the generic card-grows-into-book transition is the placeholder until this exists)
- Shelf card visual design (currently text-only, deliberately left open)
- Table of contents, in-book search, bookmarks
- Content-authoring ergonomics: a markdown-file loader, and only if truly warranted, a headless CMS
- Inline images mixed into flowing text — currently believed unnecessary now that PDF/image-only pages and markdown text cover the format space between them; revisit only if a real case emerges that neither covers

## Completed Milestones

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
