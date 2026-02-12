"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LayoutNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/g/")) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-rose-100/80 bg-rose-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-serif text-xl font-semibold text-rose-700 hover:text-rose-800"
        >
          FromMe - Valentine&apos;s Edition
        </Link>
        <Link
          href="/create"
          className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-rose-600 hover:shadow-lg"
        >
          Start Creating
        </Link>
      </div>
    </header>
  );
}
