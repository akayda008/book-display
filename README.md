# Book Display

A Next.js/React flipbook reader component. It renders text, PDF, or image-only books with a real page-turn animation, so reading digitally feels closer to reading a physical book — two-page spreads, a paper-like frame, and click-triggered page turns instead of scrolling.

## Features

- **Rich text rendering** — chapters are authored in Markdown (bold/italic, headings, lists, blockquotes, block alignment, poem-line indentation), fitted to the page by a height-based pagination engine that measures actual rendered content.
- **Page-turn animation** — a custom CSS 3D flip: a two-page spine-fold on desktop, a single-page spine-hinge flip on mobile/tablet. Respects `prefers-reduced-motion`.
- **PDF / image-only books** — a unified `pages`-type content model for pre-converted page images (comics, scans), reusing the same page-turn animation as text books.
- **Library & routing** — a shelf page listing every book, with `/[bookSlug]/[chapterSlug]` routing, explicit human-readable slugs, and a Motion-based shelf-to-reader transition.
- **Reading preferences** — font size, light/dark app theme (the book page itself always keeps its amber-paper look), and a single/two-page toggle — all persisted per browser, with reading position saved per book.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it running.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) / [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [`marked`](https://marked.js.org) for Markdown parsing, [DOMPurify](https://github.com/cure53/DOMPurify) for sanitization
- [Motion](https://motion.dev) for the shelf-opening transition

## Content

Book content is currently hardcoded in `src/data/book.ts` (no database, no CMS) — a text-type book stores Markdown per chapter, a pages-type book stores an ordered list of pre-converted page images. See `docs/1 - Project Context/Page Specification.md` for the exact content model.

## Documentation

Full project documentation lives in `docs/`, from product context through engineering standards to maintenance notes. Start at [`docs/2 - Engineering Standards/AI Context.md`](docs/2%20-%20Engineering%20Standards/AI%20Context.md) for an overview of the project, its architecture, and current status, or [`docs/1 - Project Context/Roadmap.md`](docs/1%20-%20Project%20Context/Roadmap.md) for what's been built and what's next.

## Status

v0.2 — all five sub-projects from the first planning cycle are complete (rich text formatting, page-turn animation, PDF/image-only pages, library/shelf view, reading preferences). No deployment target exists yet; this is local-development only for now.
