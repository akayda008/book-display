# Engineering Principles

## Principle 1: Survey before building custom

### Principle
Before building something custom, look for a library or component that already does the job, and weigh its trade-offs against building it yourself.

### Reason
Avoids reinventing solved problems, but also avoids adopting a library on faith — a library evaluated and rejected for a real reason is better than one skipped without looking, and better than one adopted without checking whether it fits.

### Example
`react-pageflip` and `react-markdown` were both evaluated for this project and rejected — not by default, but because each one's architecture genuinely conflicted with the existing pagination engine (lazy page generation, synchronous DOM-measurement fitting). The custom build that followed was a conclusion, not a starting assumption.

---
## Principle 2: Optimize for overall performance

### Principle
Favor implementations that keep the app fast — lazy loading, GPU-cheap animation properties, avoiding unnecessary re-renders — even when a heavier approach would be easier to build.

### Reason
This project's reading experience depends on it feeling responsive: page turns, image loading, and pagination all touch performance directly.

### Example
The page-turn animation only animates `transform`/`opacity` on the single flipping page, specifically because those properties are cheap for the browser to animate — not because it was the easiest thing to write.

---
## Principle 3: Keep implementations simple

### Principle
Prefer the simplest implementation that satisfies the actual requirement, and don't build for hypothetical future needs.

### Reason
A simpler implementation is easier to reason about, easier to extend correctly later, and less likely to hide bugs.

### Example
Inline images were dropped as a sub-project once PDF/image-only pages and markdown text together already covered the real format space — no need for a third, more complex hybrid content model.

---
## Principle 4: Fail loudly on authoring mistakes

### Principle
When content authoring can go wrong in a way that produces a silently broken result, catch it at dev-time instead of letting it fail quietly at runtime.

### Reason
A silent failure (a broken route, a mangled page) is much harder to trace back to its cause than an immediate, loud warning.

### Example
Duplicate book/chapter slugs and unclosed `:::` alignment fences both throw a dev-time warning rather than producing an ambiguous route or a chapter silently rendered wrong.

---
## Principle 5: Don't build ahead of need (YAGNI)

### Principle
Don't build a mechanism, sub-project, or abstraction before something actually needs it.

### Reason
Speculative infrastructure is a maintenance cost with no current payoff, and it's usually wrong about what the real future need turns out to be.

### Example
Content-authoring ergonomics (a markdown-file loader, or eventually a CMS) was deferred to a future milestone rather than designed speculatively now, since nothing currently blocks on it.

---
## General Rules
- Understand the problem and intended implementation before making changes. The depth of planning should match the complexity and risk of the change.
- Prefer the simplest implementation that satisfies current requirements without creating obvious future constraints.
- For decisions with meaningful architectural, UX, or product trade-offs, consider multiple approaches (including existing libraries) before implementation. Do not generate alternatives for trivial or obvious changes.
- Avoid unnecessary refactoring by considering maintainability during implementation. When refactoring is needed, keep it scoped and intentional.
