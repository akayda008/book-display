"use client";

import { Book as BookType } from "@/types/book";
import { useEffect, useRef, useState } from "react";
import { createPaginationState, generateNextPage } from "../utils/pagination";

type BookProps = {
  book: BookType;
};

type Page = {
  id: string;
  title: string;
  html: string;
};

const EMPTY_PAGE: Page = { id: "", title: "", html: "" };

const TURN_MS = 650; // page-turn animation duration, both platforms

// Below this width, the reader shows a single page instead of a two-page spread.
const MOBILE_BREAKPOINT = 1200;

const framePagePadding = "p-4 pb-10 md:p-6 lg:p-8";

export default function Book({ book }: BookProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

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

  const isBookFinished = paginationStateRef.current.chapterIndex >= book.chapters.length;

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

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

  /** Generates pages, ahead of what's currently displayed, up to `targetCount`. */
  function bufferAhead(targetCount: number): Page[] {
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;
    if (!textContainer || !textMeasure || !titleMeasure) return pages;

    const newPages = [...pages];
    while (newPages.length < targetCount) {
      const page = generateNextPage(
        book.chapters,
        paginationStateRef.current,
        titleMeasure,
        textContainer,
        textMeasure
      );
      if (!page) break;
      newPages.push(page);
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
    const atEnd = isBookFinished && currentPage + pagesPerView >= totalPages;
    if (atEnd) return;

    const buffered = bufferAhead(currentPage + pagesPerView * 3);
    // Guarantee the page this click will land on actually exists before animating to it.
    if (buffered.length <= currentPage + pagesPerView) return;

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
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;

    if (!textContainer || !textMeasure || !titleMeasure) return;

    clearAnimationTimers();
    setIsAnimating(false);
    setFlipT(0);

    const newPages: Page[] = [{ id: "blank", title: "", html: "" }];

    resetPaginationState();

    for (let i = 0; i < 3; i++) {
      const page = generateNextPage(
        book.chapters,
        paginationStateRef.current,
        titleMeasure,
        textContainer,
        textMeasure
      );
      if (!page) break;
      newPages.push(page);
    }
    setPages(newPages);
    setCurrentPage(0);
  }, [book, layoutVersion]);

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
    isAnimating || (isBookFinished && currentPage + pagesPerView >= totalPages);
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
  const leafFrontPad = isMobile ? "md:pr-12" : leafOnRight ? "md:pr-12" : "md:pl-12";
  const leafBackPad = isMobile ? "md:pr-12" : leafOnRight ? "md:pl-12" : "md:pr-12";

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

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-2">
      {/* Frame column: real frame + its measurement clone, sharing the exact same available width */}
      <div className="relative w-full">
        {/* Measure ref - kept geometrically identical to the real right page column below */}
        <div className="absolute invisible pointer-events-none mx-auto inset-x-0" style={frameSizeStyle}>
          <div className="flex h-full w-full flex-row">
            <div className={`${isMobile ? "hidden" : "block"} flex-1 overflow-hidden`} />
            <div className="w-full md:flex-1 overflow-hidden border-l">
              <div className={`${framePagePadding} md:pr-12 flex flex-col h-full`}>
                <h2 ref={titleMeasureRef} className="text-center text-2xl mb-4 empty:hidden"></h2>
                <div ref={textContainerRef} className="flex-1 min-h-0 overflow-hidden">
                  <div ref={textMeasureRef} className="w-full h-full text-xs md:text-sm lg:text-sm"></div>
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
              <div className={`${framePagePadding} md:pl-12 flex flex-col h-full`}>
                {baseLeftPage.title && <h2 className="text-center text-2xl mb-4">{baseLeftPage.title}</h2>}
                <div
                  className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                  dangerouslySetInnerHTML={{ __html: baseLeftPage.html }}
                />
              </div>
            </div>

            {/* Right Page (the only page shown on mobile) */}
            <div className="w-full md:flex-1 overflow-hidden text-black border-l bg-linear-to-l from-black/10 to-transparent">
              <div className={`${framePagePadding} md:pr-12 flex flex-col h-full`}>
                {baseRightPage.title && <h2 className="text-center text-2xl mb-4">{baseRightPage.title}</h2>}
                <div
                  className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                  dangerouslySetInnerHTML={{ __html: baseRightPage.html }}
                />
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
                  {leafFront.title && <h2 className="text-center text-2xl mb-4">{leafFront.title}</h2>}
                  <div
                    className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                    dangerouslySetInnerHTML={{ __html: leafFront.html }}
                  />
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
                    {leafBack.title && <h2 className="text-center text-2xl mb-4">{leafBack.title}</h2>}
                    <div
                      className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                      dangerouslySetInnerHTML={{ __html: leafBack.html }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none rounded-2xl z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        </div>
      </div>

      {/* Previous/Next controls, centered in a row underneath the book */}
      <div className="flex flex-row items-center justify-center gap-3 md:gap-4">
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
