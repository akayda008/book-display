# ADR-007 Dropped inline images as a separate sub-project

## Context
The original brainstorm scoped four content formats: rich text, inline images, PDF import, image-only/comic pages.

## Decision
Drop inline images as its own sub-project.

## Reason
Once PDF/image-only pages (whole scanned/illustrated books) and markdown rich text (formatted prose) both exist, the format space is already fully spanned — an illustrated story is just a pages-type book, not a special text+image hybrid.

## Alternatives Considered
### Building it as originally scoped (block-level images within flowing text)
Would have added a third, more complex hybrid content model overlapping almost entirely with two sub-projects already being built.

## Consequences
### Positive
- One less sub-project, no loss of real capability.
- Freed-up scope was redirected into rich text alignment (block-level `::: center`/`::: right`/etc.), a real gap the format space did have.
### Negative
- None identified — flagged as revisit-if-a-real-case-emerges rather than permanently closed.

## Status
Accepted
