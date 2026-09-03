"use client";

import Book from "@/components/Book";
import SettingsPanel from "@/components/SettingsPanel";
import { Book as BookType } from "@/types/book";
import { useReadingPreferences } from "@/hooks/useReadingPreferences";

/** Reader wrapper for pages-type books (no chapters, so no saved reading position). */
export default function PagesBookReader({ book }: { book: BookType }) {
  const { fontSize, setFontSize, theme, setTheme, singlePage, setSinglePage } = useReadingPreferences();

  return (
    <>
      <SettingsPanel
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={theme}
        setTheme={setTheme}
        singlePage={singlePage}
        setSinglePage={setSinglePage}
      />
      <Book book={book} fontSize={fontSize} singlePage={singlePage} />
    </>
  );
}
