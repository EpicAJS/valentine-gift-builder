"use client";

import { useEffect, useState } from "react";

const REFETCH_MS = 45_000; // refetch every 45s for a "live" feel

export function GiftsCount({
  variant = "default",
  className = ""
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = () => {
    fetch("/api/gifts/count")
      .then((res) => res.json())
      .then((data: { count?: number }) => setCount(typeof data.count === "number" ? data.count : 0))
      .catch(() => setCount(0));
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, REFETCH_MS);
    return () => clearInterval(interval);
  }, []);

  if (count === null) {
    return (
      <span
        className={`inline-block h-5 w-16 animate-pulse rounded bg-rose-200/60 ${className}`}
        aria-hidden
      />
    );
  }

  if (variant === "compact") {
    return (
      <span className={className}>
        <span className="font-semibold text-rose-700">{count.toLocaleString()}</span>
        {" "}Valentine&apos;s Day {count === 1 ? "Gift" : "Gifts"} made
        {count > 0 ? " and counting…" : ""}
      </span>
    );
  }

  return (
    <p className={className}>
      <span className="font-semibold text-rose-700">{count.toLocaleString()}</span>
      {" "}Valentine&apos;s Day {count === 1 ? "Gift" : "Gifts"} made
      {count > 0 ? " and counting…" : ""}
    </p>
  );
}
