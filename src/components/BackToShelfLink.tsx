"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookTransition } from "@/components/PageTransition";

export default function BackToShelfLink() {
  const router = useRouter();
  const { closeBook } = useBookTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    closeBook();
    router.push("/");
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="fixed top-4 left-4 z-40 text-xs text-stone-800/80 dark:text-stone-100/80 hover:text-amber-800 dark:hover:text-amber-500 underline"
    >
      ← Back to shelf
    </Link>
  );
}
