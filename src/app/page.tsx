"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { books } from "@/data/book";
import { Book as BookType } from "@/types/book";
import { useBookTransition } from "@/components/PageTransition";
import { useReadingPreferences } from "@/hooks/useReadingPreferences";

function BookCard({ book }: { book: BookType }) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { openBook } = useBookTransition();

  function handleClick() {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      openBook({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    }
    router.push(`/${book.slug}`);
  }

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className="text-left bg-amber-50 text-black rounded-lg p-6 shadow-lg flex flex-col h-full transition hover:-translate-y-1 hover:shadow-xl"
    >
      <h2 className="text-xl font-semibold mb-1">{book.title}</h2>
      <p className="text-sm italic text-black/60 mb-3">{book.author}</p>
      <p className="text-sm text-black/80">{book.blurb}</p>
    </button>
  );
}

export default function Home() {
  // Applies the saved/OS-derived theme's `dark` class to <html> - the shelf
  // has no settings panel of its own (Sub-project 5's panel lives in the
  // reader), but its background is still app chrome per ADR-008, so it
  // should reflect whatever theme was last chosen there.
  useReadingPreferences();

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl text-stone-800 dark:text-stone-100 mb-10">Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {books.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>
    </div>
  );
}
