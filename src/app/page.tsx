import Book from "@/components/Book";
import { book1 } from "@/data/book";

export default function Home(){
  return(
    <div className="flex justify-center items-center min-h-screen bg-[#993800]">
      <Book book={book1} />
    </div>
  );
}