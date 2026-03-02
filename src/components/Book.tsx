"use client";

import { Book as BookType } from "@/types/book";
import { useEffect, useRef, useState } from "react";

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
    if (spreadIndex < totalSpreads - 1) {
      setSpreadIndex((prev) => prev + 1);
    }
  }

  function previousSpread() {
    if (spreadIndex > 0) {
      setSpreadIndex((prev) => prev - 1);
    }
  }

  function paginateByHeight(
    chapters: BookType["chapters"],
    measuredHeight: HTMLDivElement,
  ) {
    const pages = [{ id: "blank", title: "", fullText: "" }];

    chapters.forEach((chapter) => {
      const words = chapter.fullText.split(" ");
      const measure = measuredHeight;

      let currentWords: string[] = [];
      let isFirstPage = true;
      let pageIndex = 0;

      for (const word of words) {
        currentWords.push(word);
        const candidateText = currentWords.join(" ");
        measure.innerText = candidateText;

        if (measure.scrollHeight > measure.clientHeight) {
          currentWords.pop();
          pages.push({
            id: chapter.id + "--page--" + pageIndex,
            title: isFirstPage ? chapter.title : "",
            fullText: currentWords.join(" "),
          });
          isFirstPage = false;
          pageIndex++;
          currentWords = [word];
        }
      }
      if (currentWords.length) {
        pages.push({
          id: chapter.id + "--page--" + pageIndex,
          title: isFirstPage ? chapter.title : "",
          fullText: currentWords.join(" "),
        });
      }
    });
    return pages;
  }

  const measureRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!measureRef.current) return;
    console.log(
      "Client Height:",
      measureRef.current.clientHeight,
      "Scroll Height:",
      measureRef.current.scrollHeight,
    );
    const newPages = paginateByHeight(book.chapters, measureRef.current);
    setPages(newPages);
  }, [book]);

  return (
    <div className="relative">
      {/* Measure ref */}
      <div
        ref={measureRef}
        className={`
          absolute invisible pointer-events-none 
          w-250 h-150 mx-auto
          overflow-hidden
          p-8 pb-12
        `}
      >
              <h2 className="text-center text-2xl mb-4"></h2>
              {/* whitespace-pre-line preserves the line breaks in the text, keeping the original formatting */}
              <p className="w-full text-justify whitespace-pre-line text-xs"></p>
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
          <div className="flex h-full flex-row">
            {/* Left Page */}
            <div
              className={`
              flex-1 overflow-hidden text-black 
              bg-linear-to-r from-black/10 to-transparent 
            `}
            >
              <div className="p-8 pl-12 pb-12">
                <h2 className="text-center text-2xl mb-4">{leftPage.title}</h2>
                {/* whitespace-pre-line preserves the line breaks in the text, keeping the original formatting */}
                <p className="w-full text-justify whitespace-pre-line text-xs">
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
                <h2 className="text-center text-2xl mb-4">{rightPage.title}</h2>
                <p className="w-full text-justify whitespace-pre-line text-xs">
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
            disabled={spreadIndex === totalSpreads - 1}
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
