## 2026-09-02 — Sub-project 3: Corrective round 2

- **Milestone/cycle**: A second corrective round on Sub-project 3. Round 1's fix (canceling the spine gutter for image pages only) made the reported symptom go away, but the user found the real issue while re-checking: the same misalignment existed on text pages too, and within the single-page view (0-1200px) there were really three different-looking sub-ranges, not one consistent look — leftover from before Sub-project 2 moved the single/two-page cutoff to 1200px while several styles were still tied to Tailwind's default 768px/1024px breakpoints.

- **What was done**, in plain terms:
  - Reverted round 1's approach of only fixing images, and instead fixed the actual cause: several styles inside the page frame — the spine-side gutter, the inner padding, the body-text size, and the spacing around the frame — were still written as Tailwind responsive classes (`md:`, `lg:`) tied to 768px/1024px, even though the reader's own single-page-vs-two-page decision happens at a different, JS-driven 1200px. That meant a "single page" could look three subtly different ways depending on exactly how wide the window was (0-768px, 768-1024px, 1024-1200px), instead of looking the same and just scaling with the frame.
  - Consolidated all of those to one fixed value, matching what the widest single-page sub-range (1024-1200px) already looked like: page padding is now always `p-8` (was a `p-4`/`p-6`/`p-8` step), body text is always `text-sm` (was `text-xs`/`text-sm`), and the gap around the frame and between the buttons is always `gap-4` (was `gap-3`/`gap-4`). These no longer depend on any breakpoint at all — they're now the same in single-page and two-page mode alike.
  - The spine-side gutter (extra inner margin next to the book's crease, meaningful only when two pages are shown side by side) now turns on and off based on the reader's own `isMobile` flag instead of Tailwind's `md:` breakpoint, so it's simply never present in single-page view, at any width — which is what actually fixes the centering issue, for text and images alike, not just images.
  - Removed round 1's image-only counter-margin as the primary fix (kept the mechanism, but it's now only relevant in true two-page mode, and only applies automatically via the same gutter logic).
  - Logged round 1 to `docs/MISTAKES.md` — it fixed the reported symptom but not the underlying cause, since it was scoped to image pages when the same bug also affected text.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app myself — the user's manual pass confirms the visual result.

- **What's left**: Nothing scoped to this corrective round is left undone. The two-page (≥1200px) view was not reported as having issues and wasn't a target of this round beyond keeping it visually equivalent to before (it already matched the tier this round unified everything else to).

## 2026-09-02 — Sub-project 3: Corrective round 1

- **Milestone/cycle**: A small corrective round on Sub-project 3, from round-1 manual verification. Everything else passed (text book unaffected, desktop spread, mobile advance/animation, broken-page placeholder, reduced motion); only the single-page image centering needed fixing.

- **What was done**, in plain terms:
  - The page frame's inner padding has a small extra "gutter" (`md:pl-12`/`md:pr-12`, an extra ~3rem of space) on whichever side faces the book's spine — that's there so running text doesn't sit flush against the crease in a two-page spread. That gutter kicks in at a CSS breakpoint of 768px, but the reader's own single-page-vs-two-page switch happens at a wider, separate breakpoint (1200px). Between those two numbers, the reader is still showing a single page, but the gutter CSS was already active — so a centered image in that single page ended up off-center (nudged away from the spine side), even though left-aligned text never showed the same problem.
  - Fixed by having image pages specifically cancel out that gutter with an equal, opposite margin, so an image page's usable width is always the same symmetric box regardless of which breakpoint is in play. Text pages are untouched — they still get the gutter as before. Changed only `src/components/Book.tsx` (`renderPageBody` now takes which side the gutter is on, and a small new `gutterCounterClass` helper cancels it for `image`-kind pages).

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app myself — the fix is scoped purely to the image-page rendering path and doesn't touch text pagination or measurement, so no regression risk there was expected or introduced by this reasoning; the user's manual pass confirms actual centering.

- **What's left**: Nothing scoped to this corrective round is left undone.

## 2026-09-02 — Sub-project 3: PDF import / image-only pages

- **Milestone/cycle**: Sub-project 3 — a unified `pages`-type content model for PDF-import and image-only/comic books, reusing the page-turn animation from Sub-project 2 unchanged.

- **What was done**, in plain terms:
  - `Book` now has a `content` field instead of a flat `chapters` array. `content` is one of two shapes: `{ type: "text", chapters: [...] }` (the existing prose books) or `{ type: "pages", pages: [...image URLs...], startsWithBlankPage? }` (new — PDF/comic books, where every "page" is just a picture). A book is always one or the other, never both (`src/types/book.ts`).
  - `src/components/Book.tsx` (the reader) now checks `book.content.type` and takes one of two paths:
    - Text books: exactly the same pagination-engine-driven flow as before — nothing changed here.
    - Pages books: no pagination engine involved at all. The full list of page images is known upfront (no lazy generation, no "buffering ahead" — an image is either in the array or it isn't), so the reader just builds the page list once and indexes straight into it.
  - The page-turn flip animation itself (the flipping "leaf", front/back faces, desktop two-page spread vs. mobile single page, reduced-motion, disabling buttons mid-flip) is **completely unchanged** — it was written generically enough that it just works once each page is described the same way internally, whether that page is text HTML or an image.
  - Internally, a "page" can now be one of three kinds: `text` (title + HTML, as before), `image` (a picture), or `blank` (the placeholder used before a chapter/book starts). Two small render helper functions pick what to show based on the kind.
  - If a page image fails to load, a "Page unavailable" message shows in its place instead of a broken-image icon or a crash — handled via the image's `onError` callback.
  - Added a temporary way to view a pages-type book, since there's no shelf/routing yet to pick between books (that's Sub-project 4): visiting `/?pages=1` swaps in a small fixture book (`pagesTestBook` in `src/data/book.ts`) made of 6 placeholder page images. Plain `/` still shows the normal text book. This is clearly marked as temporary in both files and should be removed once real routing exists.
  - Added 5 placeholder page images (simple colored squares with a large page number, as SVGs) under `public/books/test-pages/`, plus a 6th page entry that deliberately points at a file that doesn't exist, to exercise the "page unavailable" placeholder.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app or verify it visually — that's the user's manual-test pass (see the report sent back to the planning session for the exact steps).

- **What's left**: Nothing scoped to this milestone is left undone. Out-of-scope items (live PDF parsing, real shelf/routing, the resize position-loss bug) were intentionally not touched, per the hand-off brief.

## 2026-09-02 — Sub-project 2: Corrective round 4

- **Milestone/cycle**: A fourth, small corrective round, from round 3's own fix. Round 3 removed the frame's flat 1000px width ceiling so it could keep growing on large screens — but the *outer wrapper* around the whole button/book layout still had its own, separate 1200px cap, left over from before round 2's sizing rework. On a wide, tall screen the frame's new width can now legitimately exceed 1200px, which means it no longer fits inside that outer wrapper - an element wider than its own centering container doesn't stay centered, it just overflows off to one side.

- **What was done**, in plain terms:
  - Removed the outer wrapper's leftover 1200px cap. It was never coordinated with the frame's own sizing formula (from round 2) to begin with, and had simply gone unnoticed until round 3 raised the frame large enough to actually collide with it. The wrapper now has no width limit of its own; it's centered inside the full page (as it always was, via the page's own centering), and its `items-center` still centers the frame and the button row within it regardless of how wide it ends up.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app myself.

- **What's left**: Nothing scoped to this corrective round is left undone.

## 2026-09-02 — Sub-project 2: Corrective round 3

- **Milestone/cycle**: A third, small corrective round. Everything from round 2 was confirmed passing (desktop pagination, mobile Previous animation, single-page sizing) except one thing: the desktop two-page frame stopped growing past roughly 1440px on large screens, instead of continuing to scale up the way round 2 intended.

- **What was done**, in plain terms:
  - Round 2's sizing rule (fit the frame within a width budget and a height budget, whichever is smaller) also had a third, absolute cap tacked onto it — a flat "never bigger than 1000px" ceiling, meant as a safety net. On a small or medium screen that ceiling never came into play, since the width/height budgets were already smaller than it. On a large screen, though, it became the binding constraint instead — silently overriding the whole "scale to fill available space" rule the moment the screen was big enough. The single-page (mobile/tablet) frame has the same shape of formula but happened not to hit this in the sizes tested, since its portrait aspect ratio keeps its width well under 1000px in practice even on tall screens.
  - Removed that flat cap from both the desktop and single-page sizing formulas. The frame now scales purely by the width/height budgets, with no hidden ceiling.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app myself — that's the user's manual pass.

- **What's left**: Nothing scoped to this corrective round is left undone. Per the hand-off, this is expected to be the last correction round before close-out.

## 2026-09-02 — Sub-project 2: Corrective round 2

- **Milestone/cycle**: A second corrective round on the page-turn animation. Three items from round 1 were confirmed passing (medium/tablet gap, reduced-motion, mid-flip blank/content-pop) and needed no changes; three needed another pass.

- **What was done**, in plain terms:
  1. **Desktop pagination reverted to true advance-by-2, and the real root cause found this time.** Round 1's advance-by-1 change over-corrected — it made the two-page spread slide one page at a time (1-2, 2-3, 3-4, ...), which shows overlapping/repeated pairs instead of a clean sequence. What was actually wanted was the original advance-by-2 behavior (1-2, then 3-4, then 5-6, no repeats, no skips) — but with the *original* bug behind it actually fixed rather than just reverted back into. That bug: the animated "leaf" that flips from right to left has two sides — a front (what's showing before the turn) and a back (what should be showing once it lands). For the Previous direction, the back side's content was computed using the same formula as a *different* piece of the page (what's revealed on the left underneath the leaf), which happens to give the correct page when going forward but the *wrong* page when going backward. The practical effect: clicking Previous would very briefly show the wrong page's content on the leaf right as the turn finished, before snapping to the correct one — a visible pop that plausibly read as "content skipping" to the user. Logged in `docs/MISTAKES.md` with the full derivation. Fixed by computing that back-side content correctly for the Previous direction specifically, rather than reusing the Next direction's formula. Also found and fixed the same category of buffering off-by-one from round 1's mistake #6, this time affecting desktop as well (it just happened to be masked there before by a wider buffering margin) — the safety check that stops a click before it flips into an un-generated page now checks the correct index for both platforms uniformly.
  2. **Mobile Previous now has its own distinct animation**, rather than just playing the Next animation backward. Next was already correct and untouched. For Previous, the page you're going back to now visually arrives from the left edge (the spine side, as if coming from underneath the current page) and settles down covering it — rather than the old page looking like it was "folding into itself." Mechanically, this is a simpler one-sided version of the flip: only a front face is needed (the incoming page), since the page underneath never has to change mid-turn — it's the same page the whole time, right up until the incoming leaf finishes covering it.
  3. **Book frame resized to better fill the screen.** Previously the frame was sized purely from the *width* of the browser window, which left a lot of empty space on tall desktop windows and made the frame crowd right up to the screen edges (or overflow) on tall narrow mobile windows, since height was never part of the calculation. It's now sized to fit within both an available-width budget *and* an available-height budget at the same time (roughly 80% of window width or 78% of window height on desktop, whichever is more restrictive; roughly 90% of window width or 70% of window height on mobile/tablet, whichever is more restrictive) — so it scales to fill the actual available space on screen rather than assuming one dimension is always the limiting one. The exact percentages are a reasonable starting point rather than an exact science; flagging that the user may want to nudge them after seeing it in the browser.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app myself — that's the user's manual pass; an updated test checklist was handed back for it.

- **What's left**: Nothing scoped to this corrective round is left undone.

## 2026-09-02 — Sub-project 2: Corrective round 1

- **Milestone/cycle**: A corrective round on the page-turn animation, after the user's manual test pass found six issues (five real changes needed, one already confirmed fixed).

- **What was done**, in plain terms:
  1. **Desktop now advances one page per click, not two.** The two-page spread still *shows* two pages at once, but clicking Next/Previous now shifts which two pages are shown by one page at a time, not two — so you see every page in sequence rather than every other one. This is a deliberate change from the original spec, made at the user's explicit request after trying it.
  2. **Medium-viewport gap**: confirmed fixed by the user, no further changes needed there.
  3. **Buttons moved below the book.** Previous and Next used to sit to the left and right of the book frame; they now sit together in a single row centered underneath it, on both desktop and mobile.
  4. **Tablet-sized screens now get the single-page view.** Previously only screens narrower than 768px (roughly phone-sized) got the single-page layout; everything wider used the two-page spread, including tablets, which felt cramped. The single-page cutoff was moved up to 1200px. This also fixed a deeper inconsistency: the code that decides "is this mobile?" and the actual on-screen page layout were previously driven by two different, independently-set breakpoints (one in JavaScript, one baked into the visual styling) — a screen in the 768–1199px range could tell the app it wanted the tall single-page shape while the styling was still quietly drawing two side-by-side page columns into it, which is likely part of why the medium-viewport gap in issue 2 was so easy to trigger in the first place. Both are now driven by the same single decision, so they can't drift apart again.
  5. **Mobile page-turn now hinges from the left edge (the spine), instead of spinning like a revolving door.** The old mobile animation rotated the entire visible page around its own center — reasonable in theory, but it read as a door spinning in place rather than a page turning. It's replaced with the same front/back "leaf" technique used on desktop, just sized to the single visible page and always pivoting on the left edge, closer to how flipping a physical page actually looks.
  6. **Fixed the blank-page-after-flip bug.** Root cause: a safety check meant to stop a flip from landing on a not-yet-generated page had an off-by-one error in its arithmetic (it checked one page index earlier than the one actually needed), so on mobile it wasn't actually preventing anything. Logged in `docs/MISTAKES.md` with the full detail. Beyond fixing that specific formula, the deeper design that made the bug possible — swapping the displayed page's content partway through the animation — was also removed: both platforms now use the same front/back leaf-face trick, where React's page data only changes once the animation has fully finished, not mid-flight. That removes the whole category of "content changed while nobody could see whether it changed correctly" bugs, not just this one instance of it.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). As before, did not launch the app myself — that's the user's manual pass; an updated test checklist was handed back for it.

- **What's left**: Nothing scoped to this corrective round is left undone.

## 2026-09-02 — Sub-project 2: Page-turn animation

- **Milestone/cycle**: Giving the reader a real page-turn animation instead of an instant content swap — a two-page "spine flip" on desktop, a single-page 360° spin on mobile — and folding in two small cosmetic/layout fixes that had been deliberately left for this milestone.

- **What was done**, in plain terms:
  - **Desktop spine-flip**: clicking Next or Previous now animates the turning page folding over the spine (the vertical line down the middle of the open book), like a real page turning. Under the hood this uses a classic trick: a single "leaf" element sits on top of the page that's turning, with two sides — a front side showing what was there before the turn, and a back side showing what will be there once the turn finishes. It rotates in 3D from flat to fully turned; partway through, the side facing you naturally switches from front to back, so the correct new content is already in place the instant the turn completes. Nothing about the actual page content or pagination changed — only how the transition between two already-generated pages is shown.
  - **Mobile 360° spin**: on mobile there's only one page visible at a time, so instead of a fold, the whole visible page does a full spin. Its underside (visible for a moment mid-spin) is just plain paper — no picture or content on the back, as called for in the design notes — and the page's actual content is swapped to the next/previous page exactly at the midpoint of the spin, so by the time it finishes rotating back to face you, it's already showing the new page.
  - **No mid-flip waiting**: the app already generated a few pages ahead of what's on screen (so page-splitting, which is slow, doesn't have to happen during a click); this milestone just makes sure that buffer is always topped up *before* an animation starts, not during it, so a turn never has to pause partway through waiting for content.
  - **Reduced motion respected**: if the reader's operating system has "reduce motion" turned on (an accessibility setting), page turns become an instant swap instead — no animation at all.
  - **Buttons go inert mid-turn**: while a page-turn animation is playing, both Previous and Next are disabled, so clicking rapidly can't queue up multiple turns or cut one off partway.
  - **Layout fix — medium-screen gap**: on screens roughly 768–1200px wide (common laptop/tablet sizes), the book frame could end up narrower than the space actually available next to the Previous/Next buttons, leaving a visible dark gap around it. The frame's sizing was reworked so it always fills the exact space its container actually has (capped at a sensible maximum), rather than assuming a width that might not match. The invisible page-fitting measurement area was carefully kept in lock-step with this change (it now shares the literal same container as the real frame) — this project was bitten before by the measurement area and the real page silently drifting out of sync in width, which caused text to get clipped, so this was treated carefully rather than as a cosmetic-only change.
  - **Layout fix — mobile button stacking**: on mobile, the Previous and Next buttons used to stack above and below the book (a vertical layout), meaning a reader had to reach to opposite ends of the screen to turn pages. They now sit in a single row alongside the book on every screen size.

- **Verified**: Ran `npx tsc --noEmit` (clean), `npm run lint` (clean, zero warnings), and `npm run build` (production build succeeds). Did not launch the app for a visual/behavioral check — per this project's process, that's the user's manual pass; a test checklist was handed back for that.

- **What's left**: Nothing scoped to this milestone is left undone. Everything named as out-of-scope (drag-to-turn, PDF/image pages, the resize/repagination position-loss bug) was left untouched, as directed.

### Concepts worth flagging
- **CSS 3D transforms (`rotateY`, `perspective`, `backface-visibility`)** — the specific mechanism behind the flip/spin, and the "two-sided card" trick (a front face and a pre-rotated back face, each hidden when facing away) used to make content swap invisibly mid-rotation instead of popping.
- **CSS Grid vs. Flexbox for the button/book/button row** — switched from Flexbox to Grid for this row specifically because Grid resolves "how much space is actually left for the middle item" more predictably when the middle item also has its own aspect-ratio-driven sizing; this is what the medium-screen gap fix relies on.

## 2026-09-02 — Sub-project 1: Corrective round 7

- **Milestone/cycle**: A small, hopefully genuinely last round, from a re-review after round 6. Round 6's width fix was confirmed correct — but the "within 1px" its own verification reported wasn't sub-pixel rounding noise; it was one real, consistently-missing pixel.

- **What was done**, in plain terms:
  - The real right-hand page has a thin visual divider line down its left edge, between the two pages of a spread (implemented as a 1px left border). The invisible measurement column, restructured in round 6 to otherwise match the real right-hand page exactly, was missing that same border — one CSS class fewer than its real counterpart. A border takes up its own sliver of space, so without it, the measurement column was exactly 1px wider than the page it was supposed to be standing in for. That's normally nothing, but for a paragraph whose very last word needed exactly that last pixel of room, it meant the word was measured as fitting and then didn't actually fit on the real page, and got clipped.
  - Added the same border class to the measurement column. Because the whole measurement area is already invisible (hidden from view but still fully laid out), the border still consumes its 1px of width without ever being seen.

- **Verified**: Re-ran the build and linter (both clean). Repeated the same instrumented direct-comparison check as round 6, this time reading and reporting the exact pixel difference rather than a "close enough" threshold — got a true, exact 0px difference in both width and height, for every generated page, on both desktop and mobile, then removed the temporary check again. Re-ran the 30x-repeated bold/italic paragraph check at desktop width once more (all 30 present) and re-confirmed the frame-resize fix from round 4 still holds.

- **What's left**: Nothing outstanding from this round. The medium-viewport (768–1200px) black-gap issue remains open and out of scope, as before.

## 2026-09-02 — Sub-project 1: Corrective round 6

- **Milestone/cycle**: A sixth round, from a re-review after round 5 (round 5's own fixes held up correctly on re-check). This one found the remaining source of the desktop-only clipping the user was still seeing: round 5 fixed height agreement between the measurement area and the real page, but never checked *width* agreement, and on desktop, it turned out to be badly wrong.

- **What was done**, in plain terms:
  - On desktop, the book shows two pages side by side, so each real page is only about half the width of the whole book frame. But the invisible measurement area was still sized to the *full* width of the frame — at a typical desktop size, that's roughly double the width of the real page it was supposed to be standing in for (measured: ~936px wide vs. the real page's ~436px). Since "how much text fits on a page" is measured by actually writing candidate text into that area and seeing how many lines it wraps to, a too-wide measurement area lets text wrap into far fewer lines than it really will on the narrower real page — so the fitting algorithm accepted more text than could actually fit, and the extra got clipped off. This had been there since the measurement area was first introduced (confirmed via history) — round 4 and round 5 both narrowed in on it without quite reaching it, since round 4's checks were mainly about height/frame-growth and round 5's numeric height check didn't happen to look at width, and on mobile (single column) the bug is invisible because the "half the frame" and "the whole frame" are the same width there.
  - Fixed it the same way as the last two rounds: instead of trying to hand-tune the measurement area's width to match, restructured it to have the *exact same* two-column layout as the real book frame (an invisible left column matching the real Left Page, and a right column matching the real Right Page), and moved the actual measurement into that right column specifically — since the right-hand page is the one that's always shown, on both mobile and desktop. This way the measurement column's width comes from the same flexbox split as the real page's width, automatically, at every screen size, rather than being something that has to be separately checked per breakpoint.

- **Verified**: Re-ran the build and linter (both clean). Repeated round 5's instrumented direct-comparison check, this time comparing both height and width together, for every generated page, at both desktop (1400px) and mobile (390px) widths — all matched within a sub-pixel rounding margin, then removed the temporary check again. Re-ran the content-clipping checks specifically at desktop width this time (the 30x-repeated bold/italic paragraph, the long list, the long blockquote) — no dropped content, and unlike before, both the left and right columns end their pages with clean whitespace, not text cut off mid-line at the edge. Also re-confirmed the frame-resize fix from round 4 and the height-parity fix from round 5 both still hold.

- **What's left**: Nothing outstanding from this round. The medium-viewport (768–1200px) black-gap issue remains open and out of scope, as before.

## 2026-09-02 — Sub-project 1: Corrective round 5

- **Milestone/cycle**: A fifth round, after the user retested round 4 and reported the frame-resizing was fixed but content clipping was "slightly better, still not good enough." This one goes one level deeper than round 4: round 4 gave the invisible measurement area and the frame each a real, fixed size, but it turned out the measurement area and the real, visible page were still computing "how much room is available" using two different methods internally — they just happened to often land on similar numbers, not the same number.

- **What was done**, in plain terms:
  - The invisible measurement area's internal layout (title on top, content area filling whatever's left below it) used one CSS approach (a height-locked flexible column). The real, visible page used a different one (content just stacking naturally, relying on the surrounding box to clip anything that overflowed). Restructured the real page's internal layout to be identical to the measurement area's — same wrapper, same "fill the remaining space after the title" mechanism — so there is exactly one shared calculation for "how much room is there," not two separate ones that were expected to coincidentally agree.
  - While verifying that, found a second, smaller discrepancy in the same spirit: the invisible measurement frame's *outer* box was sized using two conflicting instructions at once (a fixed aspect ratio, and also "fill 100% of my parent's height") — while the real, visible frame was sized using only the aspect ratio. On most screen sizes these produced the same number, but on narrow (mobile-width) screens they diverged by a visible amount. Removed the conflicting instruction from the measurement frame so it's sized the exact same way as the real one.
  - Added a temporary check (removed again before finishing) that directly compared the measurement area's measured height against the real page's actual height, for the exact same page, right as it was generated. Used this to confirm the fix rather than eyeballing it.

- **Verified**: Re-ran the build and linter (both clean). Using the temporary direct-comparison check described above, confirmed the measured height and the real rendered height now match exactly (within 1px, which is just sub-pixel rounding) across every page tested on both a desktop-width and a mobile-width screen. Also ran the same check at a mid-size (tablet-width, ~800px) screen and found a mismatch there too — but traced it to the already-known, separately-tracked "medium-viewport black gap" layout issue (the real frame is a different width than intended in that specific size range, for reasons unrelated to this fix), not a new problem. Left that alone, as directed — it's tracked separately for a later milestone. Re-ran the 30x-repeated bold/italic split-paragraph check (all 30 repetitions present, nothing dropped), re-checked the long list and blockquote test chapters (no clipping, pages now end with visible breathing room instead of text cut right at the edge), and re-confirmed the frame's on-screen size still never changes across a page click on both desktop and mobile widths (round 4's fix still holds).

- **What's left**: Nothing outstanding from this round. The medium-viewport (768–1200px) black-gap issue remains open and out of scope, as before — now with slightly more detail on its effect (it also causes the fitting measurement to disagree with the real page in that width range, since the real frame renders narrower than intended there).

## 2026-09-02 — Sub-project 1: Corrective round 4

- **Milestone/cycle**: A fourth follow-up round, triggered by something the user found during manual testing rather than a self-review pass. The underlying structural gap actually predates this milestone (it was already there in the old plain-text version) — but it undermines this milestone's own success criteria (correct, non-clipped page fitting), so it's being fixed here before merge rather than filed away for later.

- **What was done**, in plain terms:
  - The book's frame (the fixed-aspect-ratio card the pages sit inside) wasn't actually locked to its own size. Two things were missing:
    1. The invisible "how much text fits on a page" measurement area had no real height of its own — it was just sized to however much content got put in it, rather than to the actual space available inside the frame. That meant the "does this fit?" check the page-splitter uses wasn't checking against a real, fixed number, so it could occasionally accept more text than actually had room to display.
    2. The frame itself had no hard limit on its own size — only the individual left/right page panels inside it did. So if the measurement above was ever wrong, the extra content didn't just disappear quietly — it could either get invisibly clipped away (since the inner panels do clip), or, on the single-page mobile layout, actually push the whole frame taller, which is why the frame visibly resized and dragged the Previous/Next buttons up and down as you paged through the book.
  - Fixed both: gave the measurement area a real, bounded height tied to the frame's actual size, and locked the outer frame itself so it's physically incapable of growing past its intended size no matter what content lands inside it.
  - Because the measurement area's height is now correctly bounded (previously it was sized to content, which was wrong), some page break points may fall in slightly different places than before for some chapters. That's the fix working as intended, not a regression — the old break points were computed against a height that was never actually correct.

- **Verified**: Re-ran the build and linter (both clean). Drove the app in a headless browser at both desktop and mobile widths: clicked through the entire book and confirmed the frame's on-screen size never changes across a single page click (previously it would resize per page on mobile). Specifically re-checked the long bold/italic test paragraph (repeated 30 times, designed to force a mid-sentence page split) by collecting the rendered text from every page it appears on and confirming all 30 repetitions are present with nothing dropped at the split point. Also re-checked the long list and long blockquote test chapters for clipping — none found. No console errors in either viewport.
  - Note: while testing, re-confirmed the pre-existing, separately-tracked issue — paging past the end of the loaded content shows blank pages instead of the Next button disabling. Left untouched, as directed; it belongs to a different, later milestone.

- **What's left**: Nothing outstanding from this round.

## 2026-09-01 — Sub-project 1: Corrective round 3 (expected final)

- **Milestone/cycle**: A third, small follow-up round — expected to be the last one for this milestone.

- **What was done**, in plain terms:
  - Found one more spot with the same repeated-code pattern from round 1: the function that figures out how many words of a paragraph fit on a page was doing the exact same "narrow it down by checking the middle, then the middle of what's left" search as the one used for list items and quote lines — just building its candidate text slightly differently. It's now just calling the shared version instead of repeating the search logic. No behavior change, just less code to maintain.
  - There was one more small gap in the safety-cleaning (sanitizing) work: a branch of code meant for a case that doesn't currently happen (rendering on the server instead of in the browser) was skipping the cleaning step entirely, because the cleaning tool needs a real webpage to run against, which isn't available on the server. That branch isn't reachable by anything today, but leaving it as a silent gap felt like a trap for later. Rather than add a whole extra library just to make server-side cleaning possible for a path nothing currently uses, the server branch now just strips out all formatting/markup entirely and treats everything as plain safe text — simpler, and just as safe, for a path that shouldn't ever actually run.

- **Verified**: Re-ran the build and linter (both clean), re-walked through the book in a browser (no errors, paragraph splitting still looks identical), and separately tested the server-side safety fallback directly by feeding it a deliberately unsafe snippet — confirmed it comes out as plain, harmless text with no leftover formatting tags or unsafe attributes.

- **What's left**: Nothing outstanding. The Next-Page button issue flagged back in round 1 (clicking past the end of the book shows blank pages instead of the button disabling) is still there, still intentionally untouched — it belongs to a different, later milestone.

## 2026-09-01 — Sub-project 1: Corrective round 2

- **Milestone/cycle**: A second follow-up round on the rich-text-formatting work, after a closer review found two more things worth tightening up.

- **What was done**, in plain terms:
  - **Sanitizing was happening in the wrong place.** The app builds each page's content twice: once invisibly, just to measure how much text fits (this "measurement copy" never gets shown to you), and once for real, to actually display. Both copies are built from the exact same HTML text. The safety-cleaning step (DOMPurify) was only being applied to the real, visible copy — the invisible measurement copy was skipping it. That sounds harmless since it's invisible, but "invisible" here means hidden with CSS, not actually removed from the page — a browser still fully processes an invisible element's content, including running anything embedded in it. So the safety step needed to cover both copies, not just one. Rather than clean it twice in two different places, it's now cleaned once, right at the point the HTML is first created — before it ever reaches either copy. This also meant the second, later cleaning step (which was now redundant) could be removed.
  - **An all-blank quote block could show up as an empty, oddly-styled empty box.** If a `>` quote in the source text had nothing after it on every line (just blank quote markers with no actual words), the app would still draw a quote-styled box around... nothing. Added a check so a quote (or list, or poem line-block) with zero actual lines of content inside it is simply skipped, rather than drawn as an empty container. Confirmed the list and poem-line-block versions of this can't actually happen given how the text gets read in, but added the same protection to all three anyway, since it's cheap and makes the guarantee obvious rather than relying on it never coming up.

- **Verified**: Re-ran the build and linter (both clean). In the browser, deliberately tried to smuggle in a bit of unsafe embedded content (an image tag with a "when this fails to load, run some code" attribute) through a list item, and confirmed the unsafe part was stripped out and never ran, in both the invisible measurement copy and the real visible one. Also deliberately created an all-blank quote block and confirmed it produces no empty box — the text immediately before and after it sit right next to each other with nothing in between.

- **What's left**: Nothing outstanding from this round.

## 2026-09-01 — Sub-project 1: Corrective round 1

- **Milestone/cycle**: A follow-up round of small fixes on the rich-text-formatting work above, after a review pass caught a few things worth tidying up before this goes to you for testing.

- **What was done**, in plain terms:
  - The "chapter slug" work from before (a short URL-friendly nickname per chapter, like `poem-1`) turned out to be a mistake to add in this round — it actually belongs to a later milestone that deals with linking directly to a chapter, and adding it only to chapters (not to the book itself) would have caused an inconsistency down the line. So it's been removed again. The one related safety check that genuinely did belong here — catching an unclosed `:::` alignment marker — was kept.
  - Found one small, genuine limitation in how bullet lists are read from the markdown text: each bullet has to be written on a single line. If someone tried to manually wrap one bullet's text across two lines in the source, it would accidentally get treated as a new paragraph instead of a continuation of that bullet. Rather than build support for that (which wasn't part of this milestone), a comment was added in the code explaining the limitation, so nobody's caught by surprise by it later.
  - Cleaned up some repeated code: the logic for fitting a list, a quote block, and a poem's line-block onto a page was almost identical in three separate places. It's now written once and reused, which makes the file shorter and easier to trust going forward. This was a pure tidy-up — nothing about how lists/quotes/poems actually paginate changed.

- **Verified**: Re-ran the build and linter (both clean), and re-walked through the book in a browser afterward to confirm the list-splitting and bold-text-splitting behavior still works exactly as before the cleanup.

- **What's left**: Nothing outstanding from this round.

## 2026-09-01 — Sub-project 1: Rich text formatting

- **Milestone/cycle**: Teaching the book reader to understand actual formatting — bold, italics, headings, lists, quotes, poem indentation, and centered/right-aligned text — instead of only ever showing plain paragraphs.

- **What was done**, in plain terms:
  - Before this, chapter text was just one long string, and the page-splitter cut it up purely by counting words. There was no way to say "this word is bold" or "this is a bulleted list" — it was all just text.
  - Now, chapter text is written in **Markdown** — a simple way of marking up plain text with symbols like `**bold**`, `*italic*`, `##` for a sub-heading, `-` for a bullet list, `>` for a quote, and two new symbols made specifically for this project: a `|` at the start of a line for a poem's verse line (with extra spaces after the `|` controlling how far that line is indented), and a `::: center` ... `:::` wrapper for centering or right-aligning a block of text.
  - A library called `marked` reads that markup and turns it into real HTML (the same language web pages are built from) — so `**bold**` genuinely becomes bold text, not just text with asterisks around it.
  - The trickiest part was making the page-splitter aware of formatting. If a bold sentence runs right up against where a page has to end, the splitter now knows to close the bold tag cleanly at the end of the first page and reopen it at the top of the next page — so you never see a page ending with unclosed bold-formatting leaking onto the wrong page.
  - Headings always move to the next page as a whole rather than being cut in half. The same is true for a single item in a list or a single line in a quote — but the list or quote as a whole is still allowed to spread across two pages, breaking only between whole items, never mid-sentence.
  - Because the formatted text is now inserted as real HTML rather than plain text, it goes through a safety step called sanitizing (using a library called DOMPurify), which strips out anything that could be unsafe — a standard precaution whenever HTML text comes from data rather than being hand-typed directly into the page. (Corrected in round 2 below: this needs to happen everywhere the HTML gets inserted into the actual page, not just the one place the reader sees — see that entry for why.)
  - The book's 12 existing chapters were updated to use the new markup. The poems especially: their alternating-line indentation (which, it turns out, wasn't actually showing up correctly before — the browser was silently collapsing the extra spaces used to create it) now uses the new `|` marker and genuinely displays the indentation, correctly, for the first time.
  - Each chapter now also has a short `slug` (like `poem-1` or `short-story-3`) — a URL-friendly identifier that a later milestone will use for direct links to chapters. If two chapters ever accidentally get the same slug, or someone forgets to close a `:::` block, the app now prints a warning in the browser console during development, so the mistake gets caught early instead of silently breaking a page.
  - Added a small temporary "test chapter" set (bold/italic, a heading, a list, a quote, a centered block) at the end of the book, purely so the new features have something to actually show off and be checked against. These aren't part of the "real" book content — flagging them for you to decide whether to keep or remove.

- **Verified**: Ran the app in a browser and clicked through the entire book, page by page, checking that nothing looked broken, no formatting symbols leaked into the visible text, and there were no errors in the browser console. Specifically checked (using the temporary test chapters) that a long bold sentence really does split cleanly across a page break, and that a long list and a long quote both correctly continue onto a second page instead of getting cut off or forced to fit awkwardly.

- **What's left**: Nothing required is left undone. Two things are flagged for your review rather than decided unilaterally: (1) the poem indentation now visibly shows for the first time (previously invisible due to a browser quirk) — a visible change, though arguably a fix; (2) the temporary test chapters at the end of the book — kept in for now so you can see the new formatting features working, but worth deciding whether to remove before this gets merged.

### Concepts worth flagging for learning-tutor
- **Markdown** and why a purpose-built parser library (`marked`) was used instead of hand-writing text-replacement rules.
- **Sanitization** (DOMPurify) — why inserting HTML that came from data (even your own data) needs a safety pass before display, distinct from why raw user input would need it.
- **Binary search**, used here to efficiently find the largest number of words/items that fit on a page without measuring one-by-one from scratch.
- **Atomic vs. splittable content** — the distinction the pagination engine now makes between things that must move as a whole (headings) versus things that can break internally at defined boundaries (paragraphs at word boundaries; lists/quotes/poem lines at item boundaries).
