"use client"

import { Book as BookType } from "@/types/book";
import { useState } from "react";

type BookProps = {
    book: BookType;
};

export default function Book({ book }: BookProps) {
    const pages = paginateChapters(book.chapters);
    const [spreadIndex, setSpreadIndex] = useState(0);

    const totalPages = pages.length;
    const totalSpreads = Math.ceil(totalPages / 2);

    const leftPageIndex = spreadIndex * 2;
    const rightPageIndex = leftPageIndex + 1;

    const leftPage = pages[leftPageIndex] ?? {title: "", fullText: ""};
    const rightPage = pages[rightPageIndex] ?? {title: "", fullText: ""};

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

    function paginateChapters(chapters: BookType["chapters"]){
        const PAGE_MAX_LIMIT = 800;

        const resultPages = [
            {id: "blank", title:"", fullText:""}
        ]

        chapters.forEach((chapters) => {
            const text = chapters.fullText;
            let start = 0;
            let pageNumber = 0;

            while(start < text.length){
                const slice = text.slice(start, start + PAGE_MAX_LIMIT);

                resultPages.push({
                    id: chapters.id + "--page--" + pageNumber,
                    title: pageNumber === 0 ? chapters.title: "",
                    fullText: slice,
                });
                start += PAGE_MAX_LIMIT;
                pageNumber ++;
            };
        });
        return resultPages;
    }

    return (
        <div className="relative">
            {/* Book */}
            <div className="flex flex-row w-200 h-125 mx-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-amber-100 relative">
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />

                {/* Left Page */}
                <div className="flex-1 p-8 overflow-hidden text-black pl-12 bg-linear-to-r from-black/10 to-transparent">
                    <h2 className="text-center text-2xl mb-4">
                        {leftPage.title}
                    </h2>
                    {/* whitespace-pre-line preserves the line breaks in the text, keeping the original formatting */}
                    <p className="text-justify whitespace-pre-line text-xs">
                        {leftPage.fullText}
                    </p>
                </div>

                {/* Right Page */}
                <div className="flex-1 p-8 overflow-hidden text-black border-l border-black/20 pr-12 bg-linear-to-l from-black/10 to-transparent">
                    <h2 className="text-center text-2xl mb-4">
                        {rightPage.title}
                    </h2>
                    <p className="text-justify whitespace-pre-line text-xs">
                        {rightPage.fullText}
                    </p>
                </div>
            </div>
            {/* Controls */}
            <div className="flex w-250 justify-between p-8 mt-4">
                <button
                    onClick={previousSpread}
                    disabled={spreadIndex === 0}
                    className="px-4 py-2 text-md text-black rounded-2xl shadow-md transistion bg-blue-600 hover:bg-blue-400 hover:shadow-xl"
                >
                    Previous Page
                </button>
                <button
                    onClick={nextSpread}
                    disabled={spreadIndex === totalSpreads - 1}
                    className="px-4 py-2 text-md text-black rounded-2xl shadow-md transistion bg-blue-600 hover:bg-blue-400 hover:shadow-xl"
                >
                    Next Page
                </button>
            </div>
        </div>
    );
}
