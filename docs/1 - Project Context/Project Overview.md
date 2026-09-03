# Project Overview

## Purpose

Display text, images, or a PDF in a flipbook format, so reading it digitally feels like reading a physical book.

## Problem Statement

Digital reading usually feels nothing like a physical book — instant scrolling, no page-turn, no sense of a spine or paper. This project builds a reader component that keeps that physical feeling: real page-turn animation, two-page spreads, a paper-like page frame.

## Target Users

- The project's author, showcasing their own writing (stories, poems, essays).
- Other developers who fork or install this as a component/template, feeding it their own book content by editing data files.

## Scope

### In Scope

- Text books, authored in markdown (bold/italic, one heading level, lists, blockquotes, block-level alignment, poem-line indentation).
- PDF and image-only/comic books, rendered from pre-converted page images (no live PDF parsing).
- A 3D page-turn animation (click-triggered), different on desktop (two-page spread, spine-fold) and mobile (single page, 360° spin).
- A multi-book shelf/library view with per-book routing (`/[bookSlug]/[chapterSlug]`).
- Reading preferences: font size, light/dark app theme, saved reading position, single/two-page toggle.

### Out of Scope

- Inline images mixed into flowing text (covered instead by PDF/image-only pages or by markdown text — see [ADR-007: Dropped inline images](../5%20-%20Project%20Maintenance/ADR/ADR-007-dropped-inline-images.md)).
- Drag-to-turn page gesture (click-triggered only for now; deferred as a fast-follow).
- Table of contents, in-book search, bookmarks.
- Non-technical content authoring (markdown-file loader, headless CMS) — deferred to a future milestone.
- Illustrated/animated shelf artwork, and the literal "grab the spine and pull it out" gesture — deferred until that art exists.
- Accounts, multi-user publishing, comments/likes/follows.
- A general-purpose CMS.
- Purchasing, licensing, DRM, or any e-commerce.

## Core Features

- Height-based pagination engine that measures actual rendered content to fit pages, generated lazily as the reader flips.
- Markdown rendering pipeline (via `marked`) with two custom conventions layered on top: a Pandoc-style `|` line-block marker for poem indentation, and a Pandoc-style `::: center` fenced block for paragraph/block alignment.
- 3D page-turn animation built with custom CSS transforms (not a library), with two distinct mechanics for desktop and mobile.
- Unified `pages`-type content model shared by PDF imports and native image/comic books.
- Book/chapter routing with hand-set, stable `slug` fields (independent of the internal `id`).
- A settings panel for reading preferences, persisted in `localStorage`.

## Pages

- **Shelf (`/`)** — grid of book cards; click a card to open that book.
- **Reader (`/[bookSlug]/[chapterSlug]`)** — the flipbook itself, deep-linked to a chapter's first page.
- **404** — shown for an unknown book or chapter slug.

## High-Level Workflow

```text
Shelf (browse books) -> click a card -> Reader opens at saved/first chapter
  -> flip pages (click Next/Previous) -> settings panel adjusts font/theme/layout
  -> back-to-shelf link returns to the shelf
```

## Design Philosophy

The book page itself should always feel like a physical book — warm paper color, shadow, page-turn realism — regardless of app theme or reading preferences. Everything *around* the book (shelf, buttons, settings) can adapt to the reader's preferences; the book page itself stays consistent.

## Important Constraints

- The pagination engine is sequential and DOM-measurement-based — it cannot compute page N without generating pages 0..N-1 first. This shapes deep-linking, font-size changes, and any future performance work.
- No live PDF parsing in the browser — PDFs are pre-rendered to images at import time, outside the reader itself.
- No database — content is hardcoded TypeScript today; preferences and reading position live in `localStorage`.
- No deployment target yet — local development only.
