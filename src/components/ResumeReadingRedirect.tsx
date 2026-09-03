"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book as BookType } from "@/types/book";
import { getSavedChapterSlug } from "@/utils/readingPosition";

type ResumeReadingRedirectProps = {
  book: BookType;
  firstChapterSlug: string;
};

/**
 * Opening a book from the shelf (`/[bookSlug]`, no chapter segment) resumes
 * at the saved chapter if one exists, otherwise the first chapter. The
 * saved position lives in `localStorage`, which only exists client-side, so
 * this decision can't be made in the (server-rendered) route itself -
 * this client component makes it on mount and replaces the URL.
 */
export default function ResumeReadingRedirect({ book, firstChapterSlug }: ResumeReadingRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const savedSlug = getSavedChapterSlug(book.slug);
    const targetSlug =
      savedSlug && book.content.type === "text" && book.content.chapters.some((c) => c.slug === savedSlug)
        ? savedSlug
        : firstChapterSlug;
    router.replace(`/${book.slug}/${targetSlug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-800 dark:text-stone-100 text-sm">
      Loading…
    </div>
  );
}
