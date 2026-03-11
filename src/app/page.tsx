import Book from "@/components/Book";
import { book1 } from "@/data/book";

export default function Home(){
  return(
    <div className="flex justify-center items-center min-h-screen bg-linear-to-t from-emerald-950 to-teal-800">
      <Book book={book1} />
    </div>
  );
}