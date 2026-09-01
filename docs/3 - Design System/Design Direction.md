# Design Direction

## Design Overview
The interface should feel like a physical book, not a webpage. The book page itself (paper color, shadow, page-turn) stays consistent no matter what — the surrounding app (shelf, buttons, settings) can be plainer and more conventional.

---
## Design Goals
- Make the reading experience feel physical: real page-turn, two-page spread, a paper-like frame.
- Keep the app chrome (shelf, settings, navigation) out of the way — it's a frame around the book, not the point of the product.
- Support the different content types (text, PDF, images) without the reader looking different depending on what's loaded.

---
## Design Personality
The interface should feel:
- [x] Calm
- [x] Trustworthy
- [ ] Professional
- [ ] Friendly
- [ ] Minimal
- [ ] Playful
- [ ] Premium
- [ ] Technical
- [ ] Energetic
- [x] Other: Warm/physical (the amber-paper book aesthetic specifically)

### Description
Warm, unhurried, physical. The book itself is the star — amber paper, soft shadow, a subtle inner sheen. Everything else in the interface should be quiet by comparison.

---
## Target Users and Design Implications
### Primary Users
The project's author, reading/showcasing their own writing; other developers integrating this as a component for their own book content.

### Their Technical Ability
- [x] Technical (developers integrating the component)
- [x] Non-technical (readers using the finished reader — no technical ability assumed for the actual reading experience)

### Design Implications
- The reading experience itself (shelf, reader, settings) must require zero technical knowledge — it's a consumer-facing UI even though the audience for integrating content is technical.
- Provide clear feedback after actions that take time (deep-link repagination, page image loading).
- Keep workflows guided: click a book, read it, adjust preferences if wanted — no hidden or discoverable-only interactions beyond the settings panel.

---
## Visual Direction
### Overall Style
Warm and physical rather than flat/modern — the book page keeps a deliberate "real object" feel (paper color, drop shadow, gradient sheen) instead of a typical clean SaaS aesthetic. The surrounding app chrome can be plainer.

### Visual Density
- [x] Balanced

### Visual Hierarchy
1. The open book / current page content
2. Page-turn controls (Previous/Next)
3. Settings panel, back-to-shelf link
4. Everything else (shelf grid, cards)

### Decoration
- [x] Moderately (the book's paper texture/shadow/sheen is deliberate decoration in service of the physical-book feel; nothing else in the app should carry equivalent decoration)

Guidelines:
- Decoration is reserved for the book page itself — it's the one place "unnecessary" shadows/gradients are actually the point.
- Everything outside the book frame should stay plain by comparison, so the book keeps standing out.

---
## Colour Direction
Not yet fully specified — no concrete palette/hex values have been decided beyond "amber/warm paper tone" for the book page. To be filled in as the shelf and settings panel are actually built.

### Colour Rules
- Do not use colour only to communicate important information.
- Maintain sufficient contrast.
- The book page's amber-paper tone stays constant regardless of light/dark app theme — theme only affects surrounding chrome.

---
## Typography
Not yet fully specified beyond existing Tailwind defaults (Geist). To be filled in as reading-preferences (font size steps) and the settings panel are built.

### Typography Rules
- Use a clear hierarchy.
- Prioritise readability — this is a reading app first.
- Font size changes must stay within the fixed steps decided for reading preferences (not a continuous scale).

---
## Layout
### General Layout
Two-page spread on desktop (≥768px), single page on mobile or when the single-page reading preference is on. The book frame keeps a fixed aspect ratio (3:5 mobile, 5:3 desktop) regardless of book type or content.

### Responsive Behaviour
- Desktop: two-page spread, spine-fold page-turn animation.
- Mobile: single page, 360° spin page-turn animation (also used on desktop when the single-page preference is toggled on).

---
## Components
### Buttons
- Previous/Next: clearly positioned relative to the book, disabled/inert during an in-progress page-turn animation.

### Cards
- Shelf book cards: text-only for now (title/author/blurb) — visual design deliberately still open (see Roadmap: Future Ideas).

---
## Interaction Design
### User Feedback
- Page-turn animation itself is the primary feedback for a successful page change.
- A broken/missing page image shows a simple "page unavailable" placeholder rather than a raw broken-image icon.

### Loading States
- Deep-linking to a chapter may show a brief loading state while the pagination engine generates prior pages.

### Error States
- Unknown book/chapter slug: standard 404 page.
- Unclosed markdown alignment fence, duplicate slugs: dev-time warnings, not user-facing errors (these are authoring mistakes, not reader-facing states).

---
## Navigation
### Navigation Structure
Shelf (`/`) ↔ Reader (`/[bookSlug]/[chapterSlug]`), connected by card clicks (shelf → reader) and a persistent back-to-shelf link (reader → shelf).

### Navigation Principles
- Users should always know where they are (shelf vs. reading a specific book).
- The back-to-shelf link is always present in the reader — no relying on browser back alone.

---
## Accessibility
- Respect `prefers-reduced-motion` — page-turn animation falls back to an instant swap.
- The single/two-page toggle is hidden (not shown-disabled) on mobile, where it would be inert.

---
## Animation and Motion
### Overall Direction
- [x] Expressive (deliberately — the page-turn animation is the point of the product)

### Animation Principles
- The page-turn animation is the one place expressive motion is intentional; everything else (shelf transitions, settings) should stay understated by comparison.
- Respect `prefers-reduced-motion` everywhere animation is used.
- Keep animated properties GPU-cheap (`transform`/`opacity`) to avoid jank.

---
## Design Anti-Patterns
Avoid:
- Floated/wrapped text around images (rejected — doesn't fit the pagination engine's block-measurement model).
- A literal cover-art graphic on the mid-spin "back of the page" (rejected — plain paper backing only, not a decorative asset).
- Dark-mode recoloring of the book page itself (rejected — the amber-paper look stays constant).
- Any UI element that can't do anything shown as merely "disabled" instead of hidden (e.g. the single/two-page toggle on mobile).

---
## Design Decisions
See the [ADR folder](../5%20-%20Project%20Maintenance/ADR/) for the reasoning behind: the 3D page-turn mechanics ([ADR-001](../5%20-%20Project%20Maintenance/ADR/ADR-001-custom-css-page-turn-animation.md)), theme scope ([ADR-008](../5%20-%20Project%20Maintenance/ADR/ADR-008-theme-scope-app-chrome-only.md)), and the shelf's generic opening transition ([ADR-003](../5%20-%20Project%20Maintenance/ADR/ADR-003-motion-for-shelf-transition.md)).

---
## Design Review Checklist
Before considering a UI feature complete:
### Visual Design
- [ ] Does it follow the established visual direction (physical book feel on the page, plain chrome around it)?
- [ ] Is the visual hierarchy clear?
### UX
- [ ] Is the purpose of the screen clear?
- [ ] Are loading, empty, and error states handled?
### Accessibility
- [ ] Does it respect `prefers-reduced-motion`?
- [ ] Are interactive elements clearly identifiable, and hidden (not just disabled) when genuinely inert?
### Consistency
- [ ] Does this reuse the existing pagination/animation mechanisms rather than introducing a parallel one?
