"use client";

import { createContext, useContext, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// Generic "card grows into open book" transition (ADR-003): a plain amber
// rectangle grows from the clicked card's on-screen position to fill the
// viewport (covering the route change underneath), then fades away to
// reveal the destination page - and shrinks back down in reverse for the
// back-to-shelf link. Not a literal shared-element measurement of the
// reader frame - just the placeholder effect ADR-003 scopes until
// illustrated shelf art exists.
//
// The overlay element itself never changes size or position (it's always
// `fixed inset-0`, full viewport) - "growing"/"shrinking" is done entirely
// with a `transform: translate(...) scale(...)` computed to make it *look*
// like the origin/target rect, animated toward/away from the identity
// transform. Per this project's Engineering Principle 2 (GPU-cheap
// animated properties), that's deliberate: an earlier version animated the
// element's actual `x`/`y`/`width`/`height` (Motion still resolves those to
// real top/left/width/height styles, not transforms), which forces a
// browser layout recalculation on every frame and was reported as choppy in
// manual verification.

type Rect = { x: number; y: number; width: number; height: number };
type RectTransform = { x: number; y: number; scaleX: number; scaleY: number };

const IDENTITY: RectTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const GROW_MS = 450;
const FADE_MS = 300;

type Phase = "idle" | "grow" | "fadeOut" | "shrink";

type TransitionContextValue = {
  openBook: (rect: Rect) => void;
  closeBook: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useBookTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useBookTransition must be used within PageTransitionProvider");
  return ctx;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The translate+scale that makes a `fixed inset-0` (full-viewport) box render as if it were `rect` instead. */
function transformFor(rect: Rect): RectTransform {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: rect.x + rect.width / 2 - vw / 2,
    y: rect.y + rect.height / 2 - vh / 2,
    scaleX: rect.width / vw,
    scaleY: rect.height / vh,
  };
}

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [edgeTransform, setEdgeTransform] = useState<RectTransform>(IDENTITY);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function openBook(originRect: Rect) {
    clearTimers();
    if (prefersReducedMotion()) return;
    setEdgeTransform(transformFor(originRect));
    setPhase("grow");
    timersRef.current.push(setTimeout(() => setPhase("fadeOut"), GROW_MS));
    timersRef.current.push(setTimeout(() => setPhase("idle"), GROW_MS + FADE_MS));
  }

  function closeBook() {
    clearTimers();
    if (prefersReducedMotion()) return;
    setEdgeTransform(
      transformFor({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 70,
        width: 200,
        height: 140,
      })
    );
    setPhase("shrink");
    timersRef.current.push(setTimeout(() => setPhase("idle"), GROW_MS));
  }

  let initial: (RectTransform & { opacity: number }) | undefined;
  let animate: (RectTransform & { opacity: number }) | null = null;
  let duration = GROW_MS;

  if (phase === "grow") {
    initial = { ...edgeTransform, opacity: 1 };
    animate = { ...IDENTITY, opacity: 1 };
    duration = GROW_MS;
  } else if (phase === "fadeOut") {
    animate = { ...IDENTITY, opacity: 0 };
    duration = FADE_MS;
  } else if (phase === "shrink") {
    initial = { ...IDENTITY, opacity: 1 };
    animate = { ...edgeTransform, opacity: 0 };
    duration = GROW_MS;
  }

  return (
    <TransitionContext.Provider value={{ openBook, closeBook }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && animate && (
          <motion.div
            className="fixed inset-0 z-50 rounded-2xl bg-amber-50 shadow-[0_20px_60px_rgba(0,0,0,0.6)] pointer-events-none"
            style={{ willChange: "transform, opacity" }}
            initial={initial}
            animate={animate}
            transition={{ duration: duration / 1000, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
