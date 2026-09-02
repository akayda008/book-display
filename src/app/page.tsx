import Book from "@/components/Book";
import { book1, pagesTestBook } from "@/data/book";

// TEMPORARY (Sub-project 3): no shelf/routing exists yet to pick between books
// (Sub-project 4). `?pages=1` swaps in the pages-type test fixture so it can be
// manually verified. Remove this switch once real routing lands.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pages?: string }>;
}) {
  const params = await searchParams;
  const book = params.pages !== undefined ? pagesTestBook : book1;

  return(
    <div className="flex justify-center items-center min-h-screen bg-linear-to-t from-emerald-950 to-teal-800">
      <Book book={book} />
    </div>
  );
}