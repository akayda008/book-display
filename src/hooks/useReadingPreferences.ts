"use client";

import { useEffect, useState } from "react";
import { FontSize, Theme } from "@/types/preferences";

const FONT_SIZE_KEY = "book-display:font-size";
const THEME_KEY = "book-display:theme";
const SINGLE_PAGE_KEY = "book-display:single-page";

const FONT_SIZES: readonly FontSize[] = ["small", "medium", "large"];

/**
 * Global (not per-book) reading preferences: font size, theme, and the
 * single/two-page override. Read from localStorage once on mount and written
 * back on every change; all storage access is wrapped in try/catch so a
 * failure (private browsing, storage disabled) degrades silently to
 * in-memory defaults, per Data Flow.md's "Preferences & Reading Position
 * Persistence" section.
 */
// Lazy useState initializers - run once, on the client, during first render
// (not in an effect, to avoid the extra cascading re-render that would
// cause). `typeof window` guards them for the server-rendered pass, which
// falls back to the same defaults the client then reconciles against.
function initialFontSize(): FontSize {
  if (typeof window === "undefined") return "medium";
  try {
    const stored = window.localStorage.getItem(FONT_SIZE_KEY);
    if (stored && (FONT_SIZES as string[]).includes(stored)) return stored as FontSize;
  } catch {
    // localStorage unavailable - keep default
  }
  return "medium";
}

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // No stored preference yet - default to the OS setting.
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    // localStorage/matchMedia unavailable - keep default
  }
  return "light";
}

function initialSinglePage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SINGLE_PAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useReadingPreferences() {
  const [fontSize, setFontSizeState] = useState<FontSize>(initialFontSize);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [singlePage, setSinglePageState] = useState<boolean>(initialSinglePage);

  // Theme affects app chrome only (Tailwind's class-based dark mode, see
  // globals.css's `@custom-variant dark`) - the book page itself never reads
  // this class, so its amber-paper look is untouched (ADR-008).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function setFontSize(next: FontSize) {
    setFontSizeState(next);
    try {
      window.localStorage.setItem(FONT_SIZE_KEY, next);
    } catch {
      // localStorage unavailable - preference stays in-memory only
    }
  }

  function setTheme(next: Theme) {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // localStorage unavailable - preference stays in-memory only
    }
  }

  function setSinglePage(next: boolean) {
    setSinglePageState(next);
    try {
      window.localStorage.setItem(SINGLE_PAGE_KEY, String(next));
    } catch {
      // localStorage unavailable - preference stays in-memory only
    }
  }

  return { fontSize, setFontSize, theme, setTheme, singlePage, setSinglePage };
}
