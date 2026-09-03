# ADR-001 Custom CSS 3D transforms for the page-turn animation, not react-pageflip

## Context
Needed a realistic page-turn animation for the flipbook reader, on top of an existing lazy, DOM-measurement-based pagination engine.

## Decision
Build the flip animation with custom CSS 3D transforms (`perspective`, `rotateY`, `backface-visibility`), not a library.

## Reason
The pagination engine generates pages incrementally and unpredictably — it doesn't know the total page count ahead of time. Custom CSS integrates directly with this; a library doesn't need to.

## Alternatives Considered
### react-pageflip (StPageFlip wrapper)
Expects a known/fixed page set up front. Feeding it pages incrementally relies on a `renderOnlyPageLengthChange` flag papering over an open, unresolved GitHub issue in that library. It also doesn't touch the pagination/measurement logic anyway — it would only wrap already-generated pages. And it bundles drag-to-turn by default, pulling in scope not yet designed.

## Consequences
### Positive
- No new dependency.
- Full control over which properties animate (`transform`/`opacity` only — GPU-cheap, addresses a real performance concern).
- Sets up cleanly for a future drag-to-turn extension (same rotation mechanism, driven by pointer position instead of a fixed timeline).
### Negative
- More animation code to write and maintain ourselves.

## Status
Accepted
