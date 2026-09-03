# ADR-004 PDF pre-rendered to images at import time, not live in-browser rendering

## Context
Needed to support PDF and image-only/comic book content in the reader.

## Decision
Convert PDF pages to images once, at import time (outside the reader). The reader only ever displays images, 1:1, no reflow.

## Reason
Keeps the reader itself simple and fast — no PDF parsing, no client-side rendering weight during actual reading.

## Alternatives Considered
### Live rendering with pdf.js
Works with any PDF dropped in without a conversion step, but adds real client-side rendering complexity to the reading experience itself.

## Consequences
### Positive
- PDF-derived books and native image/comic books converge into one shared content shape (`{type: 'pages', pages: string[]}`) — the reader doesn't need to know or care about the original source format.
- No pagination/fitting engine needed for this content type at all — page count is just the array length.
### Negative
- Adding a new PDF requires a manual/offline conversion step before it can be added to the app.

## Status
Accepted
