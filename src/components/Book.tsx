"use client";

import { Book as BookType } from "@/types/book";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPaginationState, generateNextPage } from "../utils/pagination";

type BookProps = {
  book: BookType;
  /** Internal chapter `id` (not `slug`) to open directly to, for a chapter deep-link. Text books only. */
  initialChapterId?: string;
  /** Fires (possibly repeatedly with the same id) whenever the currently-displayed chapter's `id` is known. Text books only. */
  onChapterChange?: (chapterId: string) => void;
};

type Page =
  | { kind: "text"; id: string; title: string; html: string }
  | { kind: "image"; id: string; src: string }
  | { kind: "blank"; id: string };

const EMPTY_PAGE: Page = { kind: "blank", id: "" };

const TURN_MS = 650; // page-turn animation duration, both platforms

// Below this width, the reader shows a single page instead of a two-page spread.
const MOBILE_BREAKPOINT = 1200;

// Deliberately not Tailwind-responsive (no md:/lg:): the reader's own
// single/two-page cutoff (MOBILE_BREAKPOINT, 1200px) is JS-driven and doesn't
// line up with Tailwind's default 768px/1024px breakpoints, so a handful of
// leftover responsive classes here used to create three visually different
// sub-ranges inside what is one logical single-page view (0-1200px) - most
// visibly, an inconsistent spine-side gutter that showed up on text pages too,
// not just images. One fixed value applies uniformly across the whole
// single-page range (and happens to already match what two-page mode - always
// >1024px - rendered anyway).
const framePagePadding = "p-8";
const pageTextSize = "text-sm";
const frameGap = "gap-4";

export default function Book({ book, initialChapterId, onChapterChange }: BookProps) {
  const isPagesBook = book.content.type === "pages";

  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [brokenPages, setBrokenPages] = useState<Set<string>>(new Set());

  const [isAnimating, setIsAnimating] = useState(false);
  const [flipDir, setFlipDir] = useState<1 | -1>(1);
  const [flipT, setFlipT] = useState(0); // 0 -> 1 drives the animated transform

  const totalPages = pages.length;
  // Pages shown at once, AND how many real pages one click moves through -
  // desktop shows and advances by a true, non-overlapping pair (1-2, 3-4, ...);
  // mobile shows and advances by a single page.
  const pagesPerView = isMobile ? 1 : 2;

  const leftPage = pages[currentPage] ?? EMPTY_PAGE;
  const rightPage = pages[currentPage + 1] ?? EMPTY_PAGE;

  const titleMeasureRef = useRef<HTMLHeadingElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const textMeasureRef = useRef<HTMLDivElement | null>(null);
  const paginationStateRef = useRef(createPaginationState());
  const isAnimatingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Pages-type books have no chapters and no buffering - the full page list is
  // known upfront, so "finished" is just "reached the last page" (handled via
  // totalPages directly in goNext), not a chapter-generation concept.
  const isBookFinished =
    book.content.type === "text" &&
    paginationStateRef.current.chapterIndex >= book.content.chapters.length;

  function markPageBroken(id: string) {
    setBrokenPages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Keeps the caller (the chapter route) informed of which chapter is
  // actually on screen, so it can shallow-update the URL as the reader
  // flips across a chapter boundary - a page id is `${chapterId}--page--N`,
  // so the prefix before "--page--" is the chapter id. Falls back to the
  // right page when the left is blank (only ever true at the very start of
  // the book).
  useEffect(() => {
    if (book.content.type !== "text" || !onChapterChange) return;
    const page = leftPage.kind === "text" ? leftPage : rightPage;
    if (page.kind !== "text") return;
    onChapterChange(page.id.split("--page--")[0]);
  }, [leftPage, rightPage, book.content.type, onChapterChange]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function resetPaginationState() {
    paginationStateRef.current = createPaginationState();
  }

  /** Generates pages, ahead of what's currently displayed, up to `targetCount`. Text books only - pages-type books have their full page list built upfront. */
  function bufferAhead(targetCount: number): Page[] {
    if (book.content.type !== "text") return pages;
    const chapters = book.content.chapters;

    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;
    if (!textContainer || !textMeasure || !titleMeasure) return pages;

    const newPages = [...pages];
    while (newPages.length < targetCount) {
      const page = generateNextPage(
        chapters,
        paginationStateRef.current,
        titleMeasure,
        textContainer,
        textMeasure
      );
      if (!page) break;
      newPages.push({ kind: "text", ...page });
    }

    if (newPages.length !== pages.length) setPages(newPages);
    return newPages;
  }

  function clearAnimationTimers() {
    if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
    endTimeoutRef.current = undefined;
  }

  /**
   * Drives one page turn. The currently-displayed content stays exactly as
   * it is until the animation finishes - the flip itself is a leaf overlay
   * (see the render section), not a mid-flight content swap. That's
   * deliberate: swapping React state partway through the animation was the
   * root cause of an earlier blank-page bug.
   */
  function startFlip(dir: 1 | -1, advance: () => void) {
    setIsAnimating(true);
    setFlipDir(dir);
    setFlipT(0);

    // Double rAF so the browser commits the 0-state before we animate to 1.
    requestAnimationFrame(() => requestAnimationFrame(() => setFlipT(1)));

    endTimeoutRef.current = setTimeout(() => {
      advance();
      setIsAnimating(false);
      setFlipT(0);
    }, TURN_MS);
  }

  function goNext() {
    if (isAnimatingRef.current) return;

    // Pages-type books have their full page list upfront, so "end" is simply
    // running out of array - no chapter-finished/buffering concept applies.
    const atEnd = isPagesBook
      ? currentPage + pagesPerView >= totalPages
      : isBookFinished && currentPage + pagesPerView >= totalPages;
    if (atEnd) return;

    if (!isPagesBook) {
      const buffered = bufferAhead(currentPage + pagesPerView * 3);
      // Guarantee the page this click will land on actually exists before animating to it.
      if (buffered.length <= currentPage + pagesPerView) return;
    }

    const advance = () => setCurrentPage((p) => p + pagesPerView);

    if (reducedMotionRef.current) {
      advance();
      return;
    }

    startFlip(1, advance);
  }

  function goPrevious() {
    if (isAnimatingRef.current) return;
    if (currentPage <= 0) return;

    const advance = () => setCurrentPage((p) => Math.max(0, p - pagesPerView));

    if (reducedMotionRef.current) {
      advance();
      return;
    }

    startFlip(-1, advance);
  }

  function handleResize() {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (isAnimatingRef.current) {
      clearAnimationTimers();
      setIsAnimating(false);
      setFlipT(0);
    }

    setIsMobile(mobile);
    setLayoutVersion((v) => v + 1);
  }

  useEffect(() => {
    clearAnimationTimers();
    setIsAnimating(false);
    setFlipT(0);
    setBrokenPages(new Set());

    if (book.content.type === "pages") {
      const content = book.content;
      const imagePages: Page[] = content.pages.map((src, i) => ({
        kind: "image",
        id: `${i}--${src}`,
        src,
      }));
      const newPages: Page[] = content.startsWithBlankPage
        ? [{ kind: "blank", id: "blank" }, ...imagePages]
        : imagePages;
      setPages(newPages);
      setCurrentPage(0);
      return;
    }

    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;

    if (!textContainer || !textMeasure || !titleMeasure) return;

    const newPages: Page[] = [{ kind: "blank", id: "blank" }];

    resetPaginationState();

    // Deep-linking to a chapter can't jump straight there - the pagination
    // engine only knows page boundaries by generating sequentially from the
    // book's start (see Architecture: Known Limitations) - so buffer forward
    // until the target chapter's first page turns up, plus a few pages past
    // it to match the normal look-ahead. A safety cap guards against an
    // infinite loop if the chapter id is somehow never produced.
    let targetIndex: number | null = null;
    const MAX_PAGES = 2000;

    while (newPages.length < MAX_PAGES) {
      const page = generateNextPage(
        book.content.chapters,
        paginationStateRef.current,
        titleMeasure,
        textContainer,
        textMeasure
      );
      if (!page) break;
      newPages.push({ kind: "text", ...page });

      if (initialChapterId && targetIndex === null && page.id === `${initialChapterId}--page--0`) {
        targetIndex = newPages.length - 1;
      }

      if (!initialChapterId) {
        if (newPages.length >= 4) break;
      } else if (targetIndex !== null && newPages.length >= targetIndex + 1 + 3) {
        break;
      }
    }

    setPages(newPages);
    setCurrentPage(
      targetIndex !== null ? targetIndex - (targetIndex % pagesPerView) : 0
    );
  }, [book, layoutVersion, initialChapterId, pagesPerView]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearAnimationTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNextDisabled =
    isAnimating ||
    (isPagesBook
      ? currentPage + pagesPerView >= totalPages
      : isBookFinished && currentPage + pagesPerView >= totalPages);
  const isPreviousDisabled = isAnimating || currentPage === 0;

  // Mobile Previous is visually distinct from every other turn: instead of
  // the *current* page flipping away to reveal what's underneath, the
  // *incoming* page arrives from the left edge and settles on top, since a
  // single mobile page has no natural mirror point to hinge the outgoing
  // page against the way desktop's spine does.
  const isMobilePrevious = isMobile && flipDir === -1;
  const leafOnRight = isMobile ? true : flipDir === 1;

  let leafFront: Page = rightPage;
  let leafBack: Page = rightPage;
  let baseLeftPage: Page = leftPage;
  let baseRightPage: Page = rightPage;

  if (isAnimating) {
    if (isMobilePrevious) {
      // Base stays on the current page the whole time; the incoming leaf
      // (single-faced, see below) is what carries the new content in.
      leafFront = leftPage; // pages[currentPage] - the page we're turning back to
      baseRightPage = rightPage;
    } else if (isMobile) {
      leafFront = rightPage; // the single page currently on screen
      leafBack = pages[currentPage + 2] ?? EMPTY_PAGE;
      baseRightPage = leafBack; // only one slot on mobile - revealed target == landed target
    } else if (flipDir === 1) {
      leafFront = rightPage; // old right page
      leafBack = pages[currentPage + pagesPerView] ?? EMPTY_PAGE; // becomes the new left page
      baseLeftPage = leftPage; // stays until the leaf lands on top of it
      baseRightPage = pages[currentPage + pagesPerView + 1] ?? EMPTY_PAGE; // new right page, revealed as the leaf lifts
    } else {
      leafFront = leftPage; // old left page
      // Becomes the new *right* page (the leaf lands mirrored, on the right slot) -
      // a previous round used `pages[currentPage - pagesPerView]` here by mistake,
      // which put the new *left* page's content on a leaf visually landing on the
      // right, producing a content mismatch/pop right as the turn completed.
      leafBack = pages[currentPage - pagesPerView + 1] ?? EMPTY_PAGE;
      baseRightPage = rightPage; // stays until the leaf lands on top of it
      baseLeftPage = pages[currentPage - pagesPerView] ?? EMPTY_PAGE; // new left page, revealed as the leaf lifts
    }
  }

  const leafAngle = isMobilePrevious ? -180 + 180 * flipT : flipDir * -180 * flipT;
  const leafFrontSide: "left" | "right" = isMobile ? "right" : leafOnRight ? "right" : "left";
  const leafBackSide: "left" | "right" = isMobile ? "right" : leafOnRight ? "left" : "right";

  // Spine-side gutter, extra inner margin away from the book's crease -
  // meaningful only in true two-page mode (a single visible page has no
  // spine to gutter against). Gated on the JS `isMobile` flag rather than a
  // Tailwind `md:`/`lg:` breakpoint, since MOBILE_BREAKPOINT (1200px) doesn't
  // line up with Tailwind's defaults (768px/1024px) - a `md:`-based gutter
  // used to stay active for part of the single-page range, which is what
  // caused the off-center content reported in verification.
  function gutterPad(side: "left" | "right") {
    if (isMobile) return "";
    return side === "left" ? "pl-12" : "pr-12";
  }
  const leafFrontPad = gutterPad(leafFrontSide);
  const leafBackPad = gutterPad(leafBackSide);

  // Frame sizing: scale to fill the available viewport (both width and
  // height) uniformly, rather than deriving from width alone. Desktop aims
  // for ~80% of viewport width with height following the 5:3 ratio; mobile
  // aims for ~70% of viewport height with width following the 3:5 ratio -
  // each expressed as the more restrictive of a width cap and a
  // height-derived width cap, so the frame never overflows the viewport in
  // the other dimension either. Deliberately no absolute pixel cap: an
  // earlier version added one (62.5rem) as a safety net, but it stopped the
  // desktop frame from growing past ~1440px on large screens, defeating the
  // whole point of scaling to fill available space.
  const frameSizeStyle = isMobile
    ? { width: "min(90vw, calc(70vh * 3 / 5))", aspectRatio: "3 / 5" }
    : { width: "min(80vw, calc(78vh * 5 / 3))", aspectRatio: "5 / 3" };

  function renderPageTitle(page: Page) {
    if (page.kind !== "text" || !page.title) return null;
    return <h2 className="text-center text-2xl mb-4">{page.title}</h2>;
  }

  // Image pages sit in the same padded/guttered slot as text pages -
  // gutterPad on the parent wrapper already pushes the empty space toward
  // the spine for both, so there's no separate gutter handling needed here
  // any more. A previous round applied a counter-margin here to cancel that
  // gutter for images specifically, on the reasoning that images "have no
  // spine gutter concept" - in practice that made the two page slots look
  // inconsistently aligned against each other in two-page mode (the empty
  // space sat on the outer edge for images, but the spine side for text),
  // which is what verification actually flagged. Removed so image pages
  // gutter exactly like text pages.
  function renderPageBody(page: Page) {
    if (page.kind === "text") {
      return (
        <div
          className={`flex-1 min-h-0 overflow-hidden w-full ${pageTextSize}`}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      );
    }
    if (page.kind === "image") {
      if (brokenPages.has(page.id)) {
        return (
          <div
            className={`flex-1 min-h-0 w-full flex items-center justify-center text-black/40 ${pageTextSize} italic`}
          >
            Page unavailable
          </div>
        );
      }
      return (
        <div className="relative flex-1 min-h-0 w-full">
          <Image
            src={page.src}
            alt=""
            fill
            unoptimized
            style={{ objectFit: "contain" }}
            onError={() => markPageBroken(page.id)}
          />
        </div>
      );
    }
    return <div className="flex-1 min-h-0 overflow-hidden w-full" />;
  }

  return (
    <div className={`flex flex-col items-center ${frameGap} w-full px-2`}>
      {/* Frame column: real frame + its measurement clone, sharing the exact same available width */}
      <div className="relative w-full">
        {/* Measure ref - kept geometrically identical to the real right page column below */}
        <div className="absolute invisible pointer-events-none mx-auto inset-x-0" style={frameSizeStyle}>
          <div className="flex h-full w-full flex-row">
            <div className={`${isMobile ? "hidden" : "block"} flex-1 overflow-hidden`} />
            <div className="w-full md:flex-1 overflow-hidden border-l">
              <div className={`${framePagePadding} ${gutterPad("right")} flex flex-col h-full`}>
                <h2 ref={titleMeasureRef} className="text-center text-2xl mb-4 empty:hidden"></h2>
                <div ref={textContainerRef} className="flex-1 min-h-0 overflow-hidden">
                  <div ref={textMeasureRef} className={`w-full h-full ${pageTextSize}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book frame */}
        <div
          className="relative mx-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-amber-50 overflow-hidden"
          style={{ ...frameSizeStyle, perspective: "1800px" }}
        >
          <div className="flex h-full w-full flex-row">
            {/* Left Page */}
            <div
              className={`${isMobile ? "hidden" : "block"} flex-1 overflow-hidden text-black bg-linear-to-r from-black/10 to-transparent`}
            >
              <div className={`${framePagePadding} ${gutterPad("left")} flex flex-col h-full`}>
                {renderPageTitle(baseLeftPage)}
                {renderPageBody(baseLeftPage)}
              </div>
            </div>

            {/* Right Page (the only page shown on mobile) */}
            <div className="w-full md:flex-1 overflow-hidden text-black border-l bg-linear-to-l from-black/10 to-transparent">
              <div className={`${framePagePadding} ${gutterPad("right")} flex flex-col h-full`}>
                {renderPageTitle(baseRightPage)}
                {renderPageBody(baseRightPage)}
              </div>
            </div>
          </div>

          {/* Turning leaf */}
          {isAnimating && (
            <div
              className="absolute top-0 bottom-0 border-l"
              style={{
                left: isMobile ? 0 : leafOnRight ? "50%" : 0,
                right: isMobile ? 0 : leafOnRight ? 0 : "50%",
                transformOrigin: isMobile ? "left center" : leafOnRight ? "left center" : "right center",
                transform: `rotateY(${leafAngle}deg)`,
                transformStyle: "preserve-3d",
                transition: `transform ${TURN_MS}ms ease-in-out`,
              }}
            >
              {/* Front face - the page as it looked before the turn started
                  (for mobile Previous: the incoming page, arriving front-first) */}
              <div
                className="absolute inset-0 overflow-hidden text-black bg-amber-50"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className={`${framePagePadding} ${leafFrontPad} flex flex-col h-full`}>
                  {renderPageTitle(leafFront)}
                  {renderPageBody(leafFront)}
                </div>
              </div>

              {/* Back face - the page that lands here once the turn completes.
                  Not needed for mobile Previous: the base layer underneath already
                  shows the right thing throughout, so there's nothing for a back
                  face to reveal. */}
              {!isMobilePrevious && (
                <div
                  className="absolute inset-0 overflow-hidden text-black bg-amber-50"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className={`${framePagePadding} ${leafBackPad} flex flex-col h-full`}>
                    {renderPageTitle(leafBack)}
                    {renderPageBody(leafBack)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none rounded-2xl z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        </div>
      </div>

      {/* Previous/Next controls, centered in a row underneath the book */}
      <div className={`flex flex-row items-center justify-center ${frameGap}`}>
        <button
          onClick={goPrevious}
          disabled={isPreviousDisabled}
          className={`
            px-4 py-2 text-xs text-slate-50
            max-h-fit rounded-md shadow-2xs shadow-amber-50
            transition
            hover:bg-emerald-800 hover:shadow-sm
            disabled:opacity-40 disabled:pointer-events-none
          `}
        >
          Previous Page
        </button>
        <button
          onClick={goNext}
          disabled={isNextDisabled}
          className={`
            px-4 py-2 text-xs text-white
            max-h-fit rounded-md shadow-2xs shadow-amber-50
            transition
            hover:bg-emerald-800 hover:shadow-sm
            disabled:opacity-40 disabled:pointer-events-none
          `}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
