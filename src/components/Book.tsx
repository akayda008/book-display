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

export default function Book({ book }: BookProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const totalPages = pages.length;

  const pagesPerView = isMobile ? 1 : 2;

  const leftPage = pages[currentPage] ?? { title: "", html: "" };
  const rightPage = pages[currentPage + 1] ?? { title: "", html: "" };

  function nextSpread() {
  
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;
  
    if (!textContainer || !textMeasure || !titleMeasure) return;
  
    const newPages = [...pages];
  
    // how many pages we want loaded
    const targetPages = currentPage + (pagesPerView * 3);
  
    while (newPages.length < targetPages) {

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
    setCurrentPage(p => p + pagesPerView);
  }

  function previousSpread() {
    if (currentPage > 0) {
      setCurrentPage(p => Math.max(0, p - pagesPerView))
    }
  }

  function handleResize() {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setLayoutVersion(v => v + 1);
  }

  function resetPaginationState() {
    paginationStateRef.current = createPaginationState();
  }

  const titleMeasureRef = useRef<HTMLHeadingElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const textMeasureRef = useRef<HTMLDivElement | null>(null);
  const paginationStateRef = useRef(createPaginationState());
  // eslint-disable-next-line react-hooks/refs
  const isBookFinished = paginationStateRef.current.chapterIndex >= book.chapters.length;

  useEffect(() => {
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;

    if (!textContainer || !textMeasure || !titleMeasure) return;

    const newPages: Page[] = [
      { id: "blank", title: "", html: "" }
    ];

    resetPaginationState();

    for (let i = 0; i < 3; i++) {
      const page = generateNextPage(
        book.chapters,
        paginationStateRef.current,
        titleMeasure,
        textContainer,
        textMeasure,
      );

      if (!page) break;

      newPages.push(page);
    }
    setPages(newPages);
  }, [book, layoutVersion]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative">
      {/* Measure ref */}
      <div
        className={`
          absolute invisible pointer-events-none
          w-[90vw] md:max-w-250 aspect-3/5 md:aspect-5/3 mx-auto
        `}
      >
        <div className="flex h-full w-full flex-row">
          {/* Mirrors the real Left Page column, unused for measurement but keeps the flex-row split identical to the real frame */}
          <div className="hidden md:block flex-1 overflow-hidden" />

          {/* Mirrors the real Right Page column - always visible, so this is where measurement happens */}
          <div className="w-full md:flex-1 overflow-hidden border-l">
            <div className="p-4 pb-10 md:p-6 lg:p-8 md:pr-12 flex flex-col h-full">
              <h2
                ref={titleMeasureRef}
                className="text-center text-2xl mb-4 empty:hidden"
              ></h2>
              <div ref={textContainerRef} className="flex-1 min-h-0 overflow-hidden">
                <div
                  ref={textMeasureRef}
                  className="w-full h-full text-xs md:text-sm lg:text-sm"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center">
        {/* Previous button */}
        <button
          onClick={previousSpread}
          disabled={currentPage === 0}
          className={`
            m-2 md:mx-4 px-4 py-2 text-xs text-slate-50
            max-h-fit rounded-md shadow-2xs shadow-amber-50
            transistion
            hover:bg-emerald-800 hover:shadow-sm
          `}
        >
          Previous Page
        </button>
        {/* Book */}
        <div className="flex flex-row w-[90vw] md:max-w-250 aspect-3/5 md:aspect-5/3 mx-auto my-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-amber-50 relative overflow-hidden">
          <div className="flex h-full w-full flex-row">
            {/* Left Page */}
            <div
              className={`
              hidden md:block flex-1 overflow-hidden text-black 
              bg-linear-to-r from-black/10 to-transparent 
            `}
            >
              <div className="p-4 pb-10 md:p-6 lg:p-8 md:pl-12 flex flex-col h-full">
                {leftPage.title && (
                  <h2 className="text-center text-2xl mb-4">
                    {leftPage.title}
                  </h2>
                )}
                <div
                  className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                  dangerouslySetInnerHTML={{ __html: leftPage.html }}
                />
              </div>
            </div>

            {/* Right Page */}
            <div
              className={`
              w-full md:flex-1 overflow-hidden text-black border-l
              bg-linear-to-l from-black/10 to-transparent 
            `}
            >
              <div className="p-4 pb-10 md:p-6 lg:p-8 md:pr-12 flex flex-col h-full">
                {rightPage.title && (
                  <h2 className="text-center text-2xl mb-4">
                    {rightPage.title}
                  </h2>
                )}
                <div
                  className="flex-1 min-h-0 overflow-hidden w-full text-xs md:text-sm lg:text-sm"
                  dangerouslySetInnerHTML={{ __html: rightPage.html }}
                />
              </div>
            </div>
          </div>
          <div
            className={`
          absolute inset-0 pointer-events-none rounded-2xl z-10
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]
          `}
          />
        </div>
        <button
          onClick={nextSpread}
          disabled={isBookFinished && currentPage + pagesPerView === totalPages }
          className={`
            m-2 md:mx-4 my-auto px-4 py-2 text-xs text-white
            max-h-fit rounded-md shadow-2xs shadow-amber-50
            transistion
            hover:bg-emerald-800 hover:shadow-sm
          `}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
