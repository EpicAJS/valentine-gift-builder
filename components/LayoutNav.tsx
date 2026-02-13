"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LayoutNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/g/")) return null;

  return (
    <header
      className="sticky top-0 z-10 border-b border-rose-100/80 bg-rose-50/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]"
      style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 py-3 sm:py-4">
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-semibold text-rose-700 hover:text-rose-800 min-h-[44px] flex items-center"
        >
          <span className="truncate">FromMe</span>
          <span className="hidden sm:inline"> - Valentine&apos;s Edition</span>
        </Link>
        <Link
          href="/create"
          className="shrink-0 rounded-full bg-rose-500 px-4 sm:px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-rose-600 hover:shadow-lg min-h-[44px] inline-flex items-center justify-center"
        >
          Start Creating
        </Link>
      </div>
    </header>
  );
}
