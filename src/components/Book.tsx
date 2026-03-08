"use client";

import { Book as BookType } from "@/types/book";
import { useEffect, useRef, useState } from "react";
import { generateNextPage } from "../utils/pagination";

type BookProps = {
  book: BookType;
};

type Page = {
  id: string;
  title: string;
  fullText: string;
};

export default function Book({ book }: BookProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [spreadIndex, setSpreadIndex] = useState(0);

  const totalPages = pages.length;
  const totalSpreads = Math.ceil(totalPages / 2);

  const leftPageIndex = spreadIndex * 2;
  const rightPageIndex = leftPageIndex + 1;

  const leftPage = pages[leftPageIndex] ?? { title: "", fullText: "" };
  const rightPage = pages[rightPageIndex] ?? { title: "", fullText: "" };

  function nextSpread() {

    const nextSpreadIndex = spreadIndex + 1;
  
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;
  
    if (!textContainer || !textMeasure || !titleMeasure) return;
  
    const newPages = [...pages];
  
    // how many pages we want loaded
    const targetPages = (nextSpreadIndex + 3) * 2;
  
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
    setSpreadIndex(nextSpreadIndex);
  }

  function previousSpread() {
    if (spreadIndex > 0) {
      setSpreadIndex((prev) => prev - 1);
    }
  }

  const titleMeasureRef = useRef<HTMLHeadingElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const textMeasureRef = useRef<HTMLParagraphElement | null>(null);
  const paginationStateRef = useRef({
    chapterIndex: 0,
    pageIndex: 0,
    remainingParagraphs: [],
    isFirstPage: true,
  });
  // eslint-disable-next-line react-hooks/refs
  const isBookFinished = paginationStateRef.current.chapterIndex >= book.chapters.length;

  useEffect(() => {
    const textContainer = textContainerRef.current;
    const textMeasure = textMeasureRef.current;
    const titleMeasure = titleMeasureRef.current;

    if (!textContainer || !textMeasure || !titleMeasure) return;

    const newPages: Page[] = [
      { id: "blank", title: "", fullText: "" }
    ];

    for (let i = 0; i < 5; i++) {
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
  }, [book]);

  

  return (
    <div className="relative">
      {/* Measure ref */}
      <div
        className={`
          absolute invisible pointer-events-none 
          w-125 h-150 mx-auto
        `}
      >
        <div className="w-full h-full p-8 pb-12 pl-12 flex flex-col">
          <h2
            ref={titleMeasureRef}
            className="text-center text-2xl mb-4 empty:hidden"
          ></h2>
          <div ref={textContainerRef} className="overflow-hidden">
            <p
              ref={textMeasureRef}
              className="w-full h-full text-justify whitespace-pre-line text-sm"
            ></p>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        {/* Previous button */}
        <button
          onClick={previousSpread}
          disabled={spreadIndex === 0}
          className={`
            mx-4 my-auto px-4 py-2 text-xs text-slate-50
            max-h-fit rounded-2xl shadow-md 
            transistion bg-blue-600 
            hover:bg-blue-400 hover:shadow-xl
          `}
        >
          Previous Page
        </button>
        {/* Book */}
        <div className="flex flex-row w-250 h-150 mx-auto my-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-amber-100 relative">
          <div className="flex h-full w-full flex-row">
            {/* Left Page */}
            <div
              className={`
              flex-1 overflow-hidden text-black 
              bg-linear-to-r from-black/10 to-transparent 
            `}
            >
              <div className="p-8 pl-12 pb-12">
                {leftPage.title && (
                  <h2 className="text-center text-2xl mb-4">
                    {leftPage.title}
                  </h2>
                )}
                {/* whitespace-pre-line preserves the line breaks in the text, keeping the original formatting */}
                <p className="w-full text-justify whitespace-pre-line text-sm">
                  {leftPage.fullText}
                </p>
              </div>
            </div>

            {/* Right Page */}
            <div
              className={`
              flex-1 overflow-hidden text-black border-l
              bg-linear-to-l from-black/10 to-transparent 
            `}
            >
              <div className="p-8 pr-12 pb-12">
                {rightPage.title && (
                  <h2 className="text-center text-2xl mb-4">
                    {rightPage.title}
                  </h2>
                )}
                <p className="w-full text-justify whitespace-pre-line text-sm">
                  {rightPage.fullText}
                </p>
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
          disabled={isBookFinished && spreadIndex === totalSpreads - 1}
          className={`
            mx-4 my-auto px-4 py-2 text-xs text-slate-50
            max-h-fit rounded-2xl shadow-md 
            transistion bg-blue-600 
            hover:bg-blue-400 hover:shadow-xl
          `}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
