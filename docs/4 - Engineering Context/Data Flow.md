# Data Flow

## Overall Flow
```text
Book/Chapter data -> pagination/rendering -> displayed page -> user flips -> next page (generated on demand or read from array)
```

## Text Page Fitting
### Trigger
The reader needs a new page — initial load, flipping forward, or a repagination event (resize, font-size change).

### Steps
1. `marked` parses the chapter's markdown `fullText` into an HTML string (once per relevant chunk), including the custom `|` line-block (poem indentation) and `::: align` fence passes.
2. The pagination engine writes candidate HTML into a hidden measurement clone via `innerHTML`.
3. Binary search finds how many words/blocks fit the page's rendered height. Paragraphs split at the word level (format-aware — never inside a bold/italic span); headings, list items, and blockquote lines are atomic (fit whole or move on).
4. A chapter is forced to start on the right-hand (recto) page, inserting a blank left page if needed.
5. The fitted page's HTML is sanitized (DOMPurify) and rendered via `dangerouslySetInnerHTML`.

### Data Involved
- `Chapter.fullText` (markdown)
- `PaginationState` (chapter index, page index, remaining content) — carried across calls, not recomputed from scratch each time
- The generated `Page` object (id, title, HTML content)

### Output
One `Page` appended to the reader's in-memory page list, ready to display.

## PDF / Image Page Display
### Trigger
A pages-type book's route loads, or the reader flips to the next/previous page.

### Steps
1. Book content is `{type: 'pages', pages: string[]}` — pre-converted image URLs, produced by an offline/manual conversion step outside the app.
2. The reader looks up `pages[currentIndex]` directly — no fitting, no measurement.
3. `next/image` (fill mode + `object-fit: contain`) renders the image letterboxed inside the fixed book frame.
4. If an image fails to load, a "page unavailable" placeholder renders instead.

### Data Involved
- `Book.content.pages` (ordered image URLs)
- `Book.content.startsWithBlankPage`

### Output
The current page's image (or placeholder), displayed in the book frame.

## Chapter Deep-Link Positioning
### Trigger
A reader navigates directly to `/[bookSlug]/[chapterSlug]` (not via in-app flipping).

### Steps
1. Resolve `bookSlug`/`chapterSlug` against the book/chapter data. Unknown slug → 404.
2. For a text book: the pagination engine generates pages sequentially from the book's start, chapter by chapter, until it reaches the target chapter (it cannot skip ahead — page boundaries aren't known until measured). A brief loading state shows while this happens.
3. For a pages-type book: not applicable — pages-type books have no chapters.
4. Once positioned, the reader displays the target chapter's first page (recto-aligned).

### Data Involved
- URL params (`bookSlug`, `chapterSlug`)
- Chapter `slug` fields (hand-set, independent of `id`)

### Output
The reader open at the target chapter's first page.

## Preferences & Reading Position Persistence
### Trigger
A preference changes (font size, theme, single/two-page toggle), or the reader crosses into a new chapter.

### Steps
1. Font size, theme, and single/two-page toggle are read from/written to global `localStorage` keys (shared across all books).
2. Reading position (current chapter slug) is read from/written to a per-book `localStorage` key, updated on every chapter change.
3. A font-size or resize-triggered repagination re-anchors to the chapter that was being read (chapter-granularity), reusing the same "generate up through target chapter" logic as deep-linking — it does not reset to page 0.
4. Opening a book from the shelf checks for a saved chapter and resumes there if one exists; otherwise opens the first chapter.
5. All `localStorage` reads/writes are wrapped in try/catch — failures (private browsing, storage disabled) degrade silently to in-memory defaults.

### Data Involved
- `localStorage` keys: global preferences, per-book (`bookSlug`) reading position
- `layoutVersion` (triggers repagination)

### Output
Preferences and reading position persist across visits (when storage is available); the reader never shows blank/lost-position content after a repagination event.

## Error Handling

| Situation | Expected Behaviour |
| --------- | ------------------- |
| Unknown book or chapter slug in URL | Standard Next.js 404 |
| Book URL with no chapter segment | Redirect to first/saved chapter |
| Broken/missing page image | "Page unavailable" placeholder, rest of book stays usable |
| Duplicate slug (book or chapter) | Dev-time warning/failure, not a silent ambiguous route |
| Unclosed `:::` alignment fence | Dev-time warning, not silently swallowed into the rest of the chapter |
| `localStorage` unavailable or throws | Silent graceful degradation — defaults used, no error shown to the reader |
| Resize or font-size change mid-flip | In-progress animation is cut short and snapped to the new layout |

## Important Considerations
- The pagination engine's sequential/stateful nature (can't jump to page N) is the single biggest constraint shaping deep-linking, font-size changes, and any future performance work — see Architecture: Known Limitations.
- Pages-type books deliberately bypass almost all of this machinery — they're a much simpler data flow by design.
