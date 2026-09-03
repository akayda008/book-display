"use client";

import { useEffect, useRef, useState } from "react";
import { FontSize, Theme } from "@/types/preferences";
import { MOBILE_BREAKPOINT } from "@/components/Book";

type SettingsPanelProps = {
  fontSize: FontSize;
  setFontSize: (value: FontSize) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  singlePage: boolean;
  setSinglePage: (value: boolean) => void;
};

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

// Warm-neutral chrome palette (stone) with a muted amber/terracotta accent -
// echoes the book page's warmth without reusing its specific amber-paper
// tone, which stays reserved for the page itself (ADR-008).
const OPTION_BASE = "px-2 py-1 rounded transition";
const OPTION_ACTIVE = "bg-amber-700 dark:bg-amber-600 text-white";
const OPTION_INACTIVE = "bg-stone-900/10 dark:bg-stone-50/10 hover:bg-stone-900/20 dark:hover:bg-stone-50/20";

/**
 * Reading preferences panel, gear-triggered, positioned opposite the
 * back-to-shelf link. Visible and functional at every viewport width - only
 * the single/two-page toggle itself is hidden (not disabled) on a true
 * mobile viewport, since it's inert there (Design Direction: Accessibility
 * specifically calls out the toggle, not the whole panel - font size and
 * theme both stay meaningful on mobile).
 */
export default function SettingsPanel({
  fontSize,
  setFontSize,
  theme,
  setTheme,
  singlePage,
  setSinglePage,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on any interaction outside the panel (click, tap, or keyboard
  // focus moving away), rather than leaving it open until the gear is
  // clicked again.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    // JS-driven breakpoint, matching Book.tsx's own MOBILE_BREAKPOINT check -
    // deliberately not a Tailwind md:/lg: class, since those don't line up
    // with this reader's 1200px cutoff (see Book.tsx's framePagePadding
    // comment / MISTAKES.md for the breakpoint-mismatch bug this caused
    // before). This is the true viewport flag, not `singlePageView` - the
    // toggle is only inert when mobile *forces* single-page regardless of
    // its own state, not whenever single-page view happens to be active.
    function update() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Reading settings"
        aria-expanded={open}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-amber-800 dark:text-amber-500 bg-stone-900/10 dark:bg-stone-50/10 hover:text-amber-700 dark:hover:text-amber-400 transition"
      >
        ⚙
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 shadow-lg p-4 text-xs space-y-4">
          <div>
            <div className="mb-1 font-semibold">Font size</div>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFontSize(opt.value)}
                  className={`${OPTION_BASE} ${fontSize === opt.value ? OPTION_ACTIVE : OPTION_INACTIVE}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 font-semibold">Theme</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`${OPTION_BASE} ${theme === "light" ? OPTION_ACTIVE : OPTION_INACTIVE}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`${OPTION_BASE} ${theme === "dark" ? OPTION_ACTIVE : OPTION_INACTIVE}`}
              >
                Dark
              </button>
            </div>
          </div>

          {!isMobile && (
            <div>
              <div className="mb-1 font-semibold">Page layout</div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={singlePage}
                  onChange={(e) => setSinglePage(e.target.checked)}
                />
                Single page
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
