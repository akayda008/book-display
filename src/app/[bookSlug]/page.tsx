import { notFound, redirect } from "next/navigation";
import Book from "@/components/Book";
import BackToShelfLink from "@/components/BackToShelfLink";
import { getBookBySlug } from "@/data/book";

export default async function BookOnlyPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = getBookBySlug(bookSlug);
  if (!book) notFound();

  if (book.content.type === "text") {
    const firstChapter = book.content.chapters[0];
    if (!firstChapter) notFound();
    redirect(`/${book.slug}/${firstChapter.slug}`);
  }

  // Pages-type books have no chapter concept, so the book-only URL is their
  // reader URL directly rather than redirecting to a chapter segment.
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-linear-to-t from-emerald-950 to-teal-800">
      <BackToShelfLink />
      <Book book={book} />
    </div>
  );
}
