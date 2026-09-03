"use client";

import { useRef } from "react";
import Book from "@/components/Book";
import SettingsPanel from "@/components/SettingsPanel";
import { Book as BookType } from "@/types/book";
import { useReadingPreferences } from "@/hooks/useReadingPreferences";
import { saveChapterSlug } from "@/utils/readingPosition";

type ChapterReaderProps = {
  book: BookType;
  initialChapterId: string;
};

/**
 * Keeps the URL honest as the reader flips across a chapter boundary -
 * distinct from the saved-position `localStorage` persistence below, this
 * only tracks the address bar against what's on screen right now.
 *
 * Uses the raw History API (`window.history.replaceState`) rather than
 * `next/navigation`'s `router.replace()`. `router.replace()` still performs
 * a real App Router navigation: it re-renders this route's Server
 * Component with the new `chapterSlug`, which hands `Book` a *new*
 * `initialChapterId` prop - and `Book`'s deep-link-buffering effect depends
 * on that prop, so it re-ran on every chapter crossing, rebuilding `pages`
 * and resetting `currentPage` out from under the reader (see MISTAKES.md).
 * `history.replaceState` changes only the address bar - no React
 * re-render, no Server Component re-run, no back-stack entry.
 */
export default function ChapterReader({ book, initialChapterId }: ChapterReaderProps) {
  const lastChapterId = useRef(initialChapterId);
  const { fontSize, setFontSize, theme, setTheme, singlePage, setSinglePage } = useReadingPreferences();

  function handleChapterChange(chapterId: string) {
    if (chapterId === lastChapterId.current) return;
    lastChapterId.current = chapterId;

    if (book.content.type !== "text") return;
    const chapter = book.content.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    window.history.replaceState(null, "", `/${book.slug}/${chapter.slug}`);
    saveChapterSlug(book.slug, chapter.slug);
  }

  return (
    <>
      <SettingsPanel
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={theme}
        setTheme={setTheme}
        singlePage={singlePage}
        setSinglePage={setSinglePage}
      />
      <Book
        book={book}
        initialChapterId={initialChapterId}
        onChapterChange={handleChapterChange}
        fontSize={fontSize}
        singlePage={singlePage}
      />
    </>
  );
}
