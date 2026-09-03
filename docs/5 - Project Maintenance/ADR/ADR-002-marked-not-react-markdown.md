# ADR-002 `marked` (shared HTML string) for markdown, not react-markdown

## Context
Chapters needed markdown support (bold/italic, headings, lists, blockquotes, custom alignment/indentation markers). The existing pagination engine fits pages by synchronously mutating a hidden DOM node's content in a tight binary-search loop.

## Decision
Use `marked` to parse markdown into an HTML string once. Use that same string for both the pagination measurement clone (`innerHTML`) and the visible page (`dangerouslySetInnerHTML`, sanitized).

## Reason
The measurement loop needs raw, synchronous DOM writes — incompatible with React's batched render cycle.

## Alternatives Considered
### react-markdown
Renders markdown into React components, not raw HTML. Doesn't solve the measurement problem (still need raw HTML strings there), so it would only add a second, display-only rendering path to keep in sync with the measurement parser — more total work, not less.

## Consequences
### Positive
- One parse, one library, no second rendering path.
- Existing 12 plain-text chapters render unchanged (strict superset of prior behaviour).
### Negative
- `dangerouslySetInnerHTML` requires sanitization (added via DOMPurify) as a standing defensive measure.

## Status
Accepted
