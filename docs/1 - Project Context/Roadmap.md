# Roadmap

## Current Version

- Version: v0 (pre-release)
- Status: planning complete, implementation not yet started
- Released on: not yet released

## Current Phase

Implementing the sub-projects designed in Planning Cycle 1, in dependency order (see Important Constraints in Project Overview for why order matters here — several sub-projects touch the same core files).

**Branch restructuring (see Development Workflow):** the repo's former `main` branch (all commit history through "Some changes") is renamed to `develop` — this is where all sub-project work happens from now on. A new `main` branch is created from the very first commit (`ad533e3`, "Initial Set-up") and is reserved for production only, updated by a deliberate merge from `develop` once work is actually complete — not during active development.

## Current Milestone

### Goal

Sub-project 1: Rich text formatting. Rewrite the pagination engine to parse and fit markdown content (bold/italic, one heading level, lists, blockquotes, alignment, poem-line indentation) instead of plain text, without breaking any of the 12 existing chapters.

### Progress

- [ ] Add `marked` and wire it into a shared parse step (HTML string used for both the measurement clone and the visible page)
- [ ] Add the custom `|` line-block pre/post-processing pass for poem indentation
- [ ] Add the custom `::: center` / `::: right` / `::: left` / `::: justify` fenced-block pass for alignment
- [ ] Make the word-level binary-search splitter format-aware (never cuts inside a bold/italic span)
- [ ] Make headings/list-items/blockquote-lines atomic units (fit whole or move to the next page)
- [ ] Add DOMPurify sanitization before `dangerouslySetInnerHTML`
- [ ] Add dev-time validation for unclosed `:::` fences
- [ ] Migrate the 12 existing chapters' raw 4-space poem indentation to the new `|` marker convention
- [ ] Verify all 12 existing chapters render identically to before

## Next Milestone

### Goal

Sub-project 2: Page-turn animation (click-triggered, custom CSS 3D transforms).

### Planned Work

- Desktop two-page spine-flip mechanic (advance-by-2, front/back page reveal)
- Mobile single-page 360° spin mechanic (advance-by-1)
- Always-buffered page generation (no mid-flip content wait)
- `prefers-reduced-motion` support
- Inert buttons during an in-progress animation

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

None yet. This is the first implementation cycle — everything above is planned, not built.
