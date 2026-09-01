# ADR-008 Book page theme stays constant; light/dark affects app chrome only

## Context
Reading preferences needed a theme/dark-mode option. The reader has a deliberate amber-paper aesthetic, and some book content (PDF/image pages) is static images that can't be recolored.

## Decision
Light/dark theme affects the app chrome only (shelf background, buttons, settings panel). The book page surface always keeps its amber-paper look, regardless of theme.

## Reason
A scanned PDF/comic page image literally can't be recolored for a dark mode — this sidesteps an unanswerable question. It also preserves the "physical book" identity that's central to the product's design direction.

## Alternatives Considered
### Full dark mode including the page itself
Raises the unsolvable PDF/image-page recoloring problem, and works against the amber-paper identity already established.

## Consequences
### Positive
- No inconsistency between text-book and pages-book theming.
- Simple, clear rule with no edge cases.
### Negative
- A reader who strongly prefers full dark-mode reading doesn't get that on the book page itself — an accepted trade-off in favour of the physical-book feel.

## Status
Accepted
