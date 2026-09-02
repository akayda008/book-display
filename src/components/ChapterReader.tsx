"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
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
 * right now. `router.replace` (not `push`) so it's history-only: no new
 * back-stack entry, no re-running the route's data resolution, and no
 * re-triggering the shelf-opening transition (which only plays on an actual
 * navigation, not a URL replace).
 */
export default function ChapterReader({ book, initialChapterId }: ChapterReaderProps) {
  const router = useRouter();
  const lastChapterId = useRef(initialChapterId);

  function handleChapterChange(chapterId: string) {
    if (chapterId === lastChapterId.current) return;
    lastChapterId.current = chapterId;

    if (book.content.type !== "text") return;
    const chapter = book.content.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    router.replace(`/${book.slug}/${chapter.slug}`, { scroll: false });
  }

  return <Book book={book} initialChapterId={initialChapterId} onChapterChange={handleChapterChange} />;
}
