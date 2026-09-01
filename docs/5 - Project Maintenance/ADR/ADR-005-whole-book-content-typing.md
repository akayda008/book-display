# ADR-005 Whole-book content typing, not mixed-chapter books

## Context
Deciding whether a single `Book` could mix typed-text chapters with scanned/PDF-derived chapters.

## Decision
A `Book` is either `{type: 'text', chapters: Chapter[]}` or `{type: 'pages', pages: string[]}` — never both.

## Reason
Matches how real books actually work (no book mixes a scanned chapter into a prose book), and keeps the reader component from needing to render two structurally different chapter shapes side by side.

## Alternatives Considered
### Mixed at chapter level
More flexible in theory, but a bigger data-model and rendering change for a reading experience nobody actually wants (a prose book suddenly switching to a scanned page mid-book).

## Consequences
### Positive
- Simpler reader rendering logic.
- Directly enabled the PDF-import/image-only-pages unification (ADR-004).
### Negative
- A book that genuinely wants both text and scanned pages isn't supported — not a real use case identified so far.

## Status
Accepted
