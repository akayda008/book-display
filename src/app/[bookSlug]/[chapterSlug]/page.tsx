import { notFound } from "next/navigation";
import ChapterReader from "@/components/ChapterReader";
import BackToShelfLink from "@/components/BackToShelfLink";
import { getBookBySlug, getChapterBySlug } from "@/data/book";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
}) {
  const { bookSlug, chapterSlug } = await params;
  const book = getBookBySlug(bookSlug);
  if (!book || book.content.type !== "text") notFound();

  const chapter = getChapterBySlug(book, chapterSlug);
  if (!chapter) notFound();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-linear-to-t from-emerald-950 to-teal-800">
      <BackToShelfLink />
      <ChapterReader book={book} initialChapterId={chapter.id} />
    </div>
  );
}
