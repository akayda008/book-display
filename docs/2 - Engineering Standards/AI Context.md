# AI Context

## Project Summary
Book Display is a Next.js/React flipbook reader component. It renders text, PDF, or image-only books with a real page-turn animation, so reading digitally feels like reading a physical book. Currently at v0 (pre-release): the pagination engine and a basic two-page-spread reader exist for a single hardcoded text book; none of the five planned sub-projects (rich text formatting, page-turn animation, PDF/image pages, library/shelf view, reading preferences) have been implemented yet — see Roadmap.

## Architecture Summary
```text
data/book.ts (hardcoded Book/Chapter data, markdown in fullText)
  -> utils/pagination.ts (height-based, DOM-measurement pagination engine)
  -> components/Book.tsx (two-page spread / single-page reader, flip animation)
  -> app/ (routing: shelf at /, reader at /[bookSlug]/[chapterSlug])
```

## Project Documentation
| Information                    | Source of Truth                  |
| ------------------------------- | --------------------------------- |
| Current status and priorities   | [Roadmap](../1%20-%20Project%20Context/Roadmap.md) |
| Project purpose and scope       | [Project Overview](../1%20-%20Project%20Context/Project%20Overview.md) |
| Strategic direction             | [Vision & Goals](../1%20-%20Project%20Context/Vision%20&%20Goals.md) |
| Page-by-page structure          | [Page Specification](../1%20-%20Project%20Context/Page%20Specification.md) |
| Design rules                    | [Design Direction](../3%20-%20Design%20System/Design%20Direction.md) |
| Technical architecture          | [Architecture](../4%20-%20Engineering%20Context/Architecture.md) |
| Data behaviour                  | [Data Flow](../4%20-%20Engineering%20Context/Data%20Flow.md) |
| Development process             | [Development Workflow](Development%20Workflow.md) |
| Engineering principles          | [Engineering Principles](Engineering%20Principles.md) |
| Historical technical decisions  | [ADR folder](../5%20-%20Project%20Maintenance/ADR/) |
| Known issues and debt           | [Technical Debts](../5%20-%20Project%20Maintenance/Technical%20Debts.md) |

When documents conflict, prefer the authoritative document listed above. If the conflict affects architecture, security, product requirements, or user experience, identify the conflict before making a decision instead of silently choosing an interpretation.

## Engineering Principles
- Before building something custom, look for a library and weigh its real trade-offs — but don't adopt one that fights the existing architecture (see Engineering Principles for real examples: react-pageflip and react-markdown were both evaluated and rejected).
- Optimize for overall performance (e.g. animate only cheap `transform`/`opacity` properties, lazy-load pages/images).
- Keep implementations simple; don't build for hypothetical future needs.
- Authoring mistakes (duplicate slugs, unclosed markdown fences) should fail loudly at dev-time, not silently produce broken output.
- Don't build a mechanism before something actually needs it (YAGNI) — content-authoring ergonomics is deliberately deferred.

## Design Context
When implementing a new interface:
1. Follow [Design Direction](../3%20-%20Design%20System/Design%20Direction.md).
2. The book page itself always keeps its amber-paper look — theme/dark-mode only affects surrounding app chrome (shelf, buttons, settings panel), never the page surface.
3. Reuse the existing pagination engine and flip-animation mechanics rather than introducing a parallel one.
4. Consider loading, empty, and error states explicitly (e.g. the brief loading state during a deep-link's repagination; the "page unavailable" fallback for a broken page image).
5. Prioritise usability over visual decoration.

## Coding Conventions
- Follow existing project conventions (TypeScript, Tailwind, Next.js App Router).
- Use simple and readable implementations.
- Reuse existing modules where appropriate — especially `utils/pagination.ts` and the flip-animation logic in `components/Book.tsx`.
- Keep naming consistent with the existing codebase (`slug` vs. `id`, `pagesPerView`, `layoutVersion`).
- Avoid unnecessary abstractions.

## Development Workflow
See [Development Workflow](Development%20Workflow.md) for the full branch strategy (`main` = production only, `develop` = integration, `feature/*` per sub-project, `bug/*` for post-merge fixes). In short:
1. Understand the problem and the relevant sub-project's design notes.
2. Branch off `develop`.
3. Implement the smallest appropriate solution for that sub-project.
4. Test manually (no automated suite required).
5. Merge into `develop`. Merge `develop` into `main` only when work is genuinely production-ready.

## Things to Avoid
- Do not introduce unnecessary complexity or dependencies without weighing trade-offs first.
- Do not modify unrelated code.
- Do not make architectural changes without discussion — especially to `utils/pagination.ts`, which several sub-projects depend on.
- Do not bypass established system boundaries (e.g. don't reintroduce React-driven rendering into the pagination measurement loop — it must stay imperative DOM mutation; see Architecture).
- Do not build sub-projects out of the dependency order set in the Roadmap without checking for file-overlap conflicts first.

## Definition of Done
- Requirements from the sub-project's design/grilling notes are satisfied.
- Existing functionality (including earlier-merged sub-projects) continues to work.
- The implementation follows the existing architecture and these docs.
- Manual testing (including named edge cases) has been completed.
- Documentation has been updated where appropriate.

## Current Priorities
1. Sub-project 1: Rich text formatting (see Roadmap's Current Milestone).
2. Sub-project 2: Page-turn animation.
3. Sub-project 3: PDF import / image-only pages.
