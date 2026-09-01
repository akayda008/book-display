# Page Specifications

> This document defines the initial structure and purpose of the website.
> It is a starting point for design and development, not a final specification.

---

## Website Structure

### 1. Shelf (`/`)

**Purpose:**
Let the reader browse every available book and pick one to open.

**What should the visitor understand?**
This is a library — each card is a distinct book they can click into.

**Primary action:**
Click a book's card to open it in the reader.

**Sections:**
1. **Book grid** — a responsive grid of book cards (title/author/blurb text; cover art not yet decided).
2. **App chrome** — theme toggle and any other global settings entry point.

**Notes / Requirements:**
- Card visual design is an open, deliberate TBD — text-only placeholder for now (see Roadmap: Future Ideas).
- Clicking a card resumes at the reader's saved chapter for that book if one exists, otherwise opens the first chapter.
- Clicking a card plays a generic shared-element "card grows into open book" transition (Motion), not an abrupt page jump.

---

### 2. Reader (`/[bookSlug]/[chapterSlug]`)

**Purpose:**
The flipbook itself — read a book's content, chapter by chapter, page by page.

**What should the visitor understand?**
This is a book, not a webpage: pages turn, not scroll, and it deep-links to wherever they're reading.

**Primary action:**
Flip forward/backward through pages via Previous/Next.

**Sections:**
1. **Book frame** — two-page spread on desktop (≥768px), single page on mobile, or when the single-page preference is on.
2. **Page-turn controls** — Previous/Next buttons, each playing the page-turn animation.
3. **Settings panel** — font size, app theme, single/two-page toggle (hidden on mobile).
4. **Back-to-shelf link** — persistent, reverses the opening transition.

**Notes / Requirements:**
- Text-type books render markdown-formatted chapters through the pagination engine; pages-type books (PDF/image-only) render pre-converted page images 1:1, no pagination fitting.
- Deep-linking to a chapter can incur a brief loading state while earlier chapters are generated (pagination is sequential).
- An unknown book or chapter slug in the URL shows the 404 page.
- A book URL with no chapter segment (`/[bookSlug]`) redirects to that book's first (or saved) chapter.

---

### 3. 404

**Purpose:**
Tell the visitor the book or chapter they're looking for doesn't exist.

**What should the visitor understand?**
The link is broken or the content has moved — not that the app itself is broken.

**Primary action:**
Return to the shelf.

**Notes / Requirements:**
- Standard Next.js `notFound()` — no custom design work planned.

---

## Website-Wide Requirements

### Navigation
- Primary navigation: shelf ↔ reader, via card clicks and the back-to-shelf link.
- Important CTA: "open this book" (shelf card click).
- Footer requirements: none defined yet.

### Functional Requirements
- Book/chapter routing via hand-set `slug` fields, independent of internal `id`s.
- Reading position and preferences persist in `localStorage`, degrading silently if unavailable.

### Content Requirements
- Text-type book content authored as markdown in `Chapter.fullText`.
- Pages-type book content is pre-converted page images in `public/books/[bookSlug]/`.

### Important Constraints
- The book page's amber-paper look stays constant regardless of app theme — theme only affects surrounding chrome.
- Pages-type book images letterbox/fit inside the existing fixed book frame; the frame's aspect ratio never changes per book.

---
## Current Starting Point

**The first page/feature to work on:**
Not a page — the pagination engine rewrite (Sub-project 1: Rich text formatting) underlies both the Shelf and Reader pages and needs to land first.

**Why start here?**
Both pages depend on a stable, markdown-aware pagination engine. Building page UI before that rewrite risks rework once it lands.

**Immediate next step:**
Implement Sub-project 1 per the Roadmap's Current Milestone checklist.
