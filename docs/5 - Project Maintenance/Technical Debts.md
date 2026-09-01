# Technical Debt

## Overview
This project is pre-implementation for Planning Cycle 1 — most "debt" here is either a known limitation carried forward from the existing pagination engine, or a deliberately deferred feature, rather than debt accumulated during this cycle's work.

## Current Technical Debt

### Dead code in the pagination engine
**Problem:**
`utils/pagination.ts` has a commented-out `paginateByHeight` function left in from an earlier approach.

**Impact:**
Minor — dead code adds noise when reading the file, and could confuse future work on the pagination rewrite (Sub-project 1).

**Possible Solution:**
Remove it as part of Sub-project 1's pagination rewrite.

**Priority:**
- Low

---
### Resize/repagination position loss (being fixed in Sub-project 5)
**Problem:**
Currently, any `layoutVersion` change (today, only triggered by window resize) discards the whole `pages` array and regenerates just 3 fresh pages from the start of the book, without resetting `currentPage` — showing blank placeholder content until the reader navigates back near the start.

**Impact:**
Silently loses reading position on resize. Will become far more noticeable once font size (Sub-project 5) triggers the same path more often than resize alone.

**Possible Solution:**
Already designed — repagination re-anchors to the chapter being read, reusing the same logic needed for chapter deep-linking. Scheduled as part of Sub-project 5.

**Priority:**
- High (scheduled, not yet fixed)

## Planned Improvements
- Pagination engine rewrite for markdown support (Sub-project 1).
- Fix the resize/repagination position-loss bug (Sub-project 5).
- Add dev-time validation for duplicate slugs and unclosed `:::` fences (Sub-project 1 / Sub-project 4).

## Deferred Decisions
Decisions that have intentionally been postponed.

### Content-authoring ergonomics
**Question:**
Should content authoring move from hardcoded TypeScript to markdown files, and/or eventually a headless CMS?

**Why Deferred:**
Doesn't block anything else being built — the app works fine with hardcoded content in the meantime. The right answer also depends on how the project's audience (developer-integration, per Vision & Goals) plays out in practice.

**Revisit When:**
Whenever it's actually about to be implemented, per the Roadmap's Future Ideas — not speculatively.

---
### Drag-to-turn page gesture
**Question:**
Should the page-turn animation support drag/pointer-tracked turning, not just click-triggered?

**Why Deferred:**
A real jump in complexity (pointer tracking, partial-flip rendering, release/snap physics) beyond the click-triggered version. Click-first was chosen to ship the core animation without blocking on the harder interaction.

**Revisit When:**
As a fast-follow to Sub-project 2, once the click-triggered version is stable.

---
### Shelf card visual design
**Question:**
What should a shelf book card actually look like — cover art, illustrated style, or something else?

**Why Deferred:**
Text-only placeholder works fine for now; deciding this now (under finalization pressure) risked a forced, premature decision.

**Revisit When:**
When actually building the shelf (Sub-project 4), or once the broader illustrated-shelf art direction is tackled.

---
### Illustrated/animated shelf & literal shelf-pull gesture
**Question:**
Should the shelf eventually be a real illustration (books standing on a shelf), with a literal "grab the spine and pull it out" opening gesture?

**Why Deferred:**
Depends on art/illustration work outside this cycle's scope. The generic "card grows into book" transition (Motion) is the interim placeholder — built so it can be extended into the literal gesture later, not thrown away.

**Revisit When:**
Whenever the shelf illustration work is actually undertaken.
