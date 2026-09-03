import { notFound } from "next/navigation";
import BackToShelfLink from "@/components/BackToShelfLink";
import PagesBookReader from "@/components/PagesBookReader";
import ResumeReadingRedirect from "@/components/ResumeReadingRedirect";
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
    // Saved reading position lives in localStorage, so the resume-or-first
    // decision has to be made client-side - see ResumeReadingRedirect.
    return <ResumeReadingRedirect book={book} firstChapterSlug={firstChapter.slug} />;
  }

  // Pages-type books have no chapter concept, so the book-only URL is their
  // reader URL directly rather than redirecting to a chapter segment.
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-stone-100 dark:bg-stone-950">
      <BackToShelfLink />
      <PagesBookReader book={book} />
    </div>
  );
}
