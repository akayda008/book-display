# Vision & Goals

## Vision

A reusable flipbook reader component: something a developer can fork or install and point at their own book — text, PDF, or scanned images — and get a reader that feels like turning real pages.

## Objectives

- Make digital reading feel like a physical book: real page-turn animation, two-page spreads, a consistent paper aesthetic.
- Support the formats people actually have: markdown-authored prose, PDFs, and scanned/comic images.
- Let a developer plug in their own book by editing data files and following docs — no CMS, no hosted service required.

## Non-Goals

- Not a full publishing platform — no accounts, no multi-user publishing, no social features (comments/likes/follows).
- Not a general-purpose CMS — content-authoring stays lightweight (data files, later possibly markdown files); it doesn't compete with WordPress/Ghost/etc.
- Not an e-reader or store — no purchasing, licensing, DRM, or e-commerce.
- Not a non-technical hosted product — "reusable" means another developer integrates it via code, not a stranger using it with no technical setup.

## Long-Term Direction

Stay a component a developer installs and configures, not a service they sign up for. Content-authoring ergonomics (markdown files, and only if truly warranted, a CMS) may improve over time, but always in service of making it easier for a developer to bring their own content — not to turn this into a hosted multi-tenant product.

Everything currently marked "out of scope" in the Project Overview (inline images, drag-to-turn, table of contents/search, illustrated shelf art, non-technical content authoring) is deferred, not rejected — see Roadmap's Future Ideas for which of these might actually get picked up later.

## Success Criteria

- It feels like reading a real book — page-turn realism and the physical-paper aesthetic aren't compromised for the sake of adding features.
- A developer could actually plug in their own book (text, PDF, or images) with reasonable effort, following the existing data model and docs.
- The project's author keeps using it to showcase their own writing.
