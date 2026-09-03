const POSITION_KEY_PREFIX = "book-display:position:";

/** Reads the saved chapter slug for a book (per-book key), or null if none is saved / storage is unavailable. */
export function getSavedChapterSlug(bookSlug: string): string | null {
  try {
    return window.localStorage.getItem(`${POSITION_KEY_PREFIX}${bookSlug}`);
  } catch {
    return null;
  }
}

/** Saves the current chapter slug for a book. Silently does nothing if storage is unavailable. */
export function saveChapterSlug(bookSlug: string, chapterSlug: string) {
  try {
    window.localStorage.setItem(`${POSITION_KEY_PREFIX}${bookSlug}`, chapterSlug);
  } catch {
    // localStorage unavailable (private browsing, storage disabled) - degrade silently
  }
}
