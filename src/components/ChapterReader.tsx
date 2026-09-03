"use client";

import { useRef } from "react";
import Book from "@/components/Book";
import { Book as BookType } from "@/types/book";

type ChapterReaderProps = {
  book: BookType;
  initialChapterId: string;
};

/**
 * Keeps the URL honest as the reader flips across a chapter boundary -
 * distinct from Sub-project 5's planned saved-position `localStorage`
 * persistence, this only tracks the address bar against what's on screen
 * right now.
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

  function handleChapterChange(chapterId: string) {
    if (chapterId === lastChapterId.current) return;
    lastChapterId.current = chapterId;

    if (book.content.type !== "text") return;
    const chapter = book.content.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    window.history.replaceState(null, "", `/${book.slug}/${chapter.slug}`);
  }

  return <Book book={book} initialChapterId={initialChapterId} onChapterChange={handleChapterChange} />;
}
