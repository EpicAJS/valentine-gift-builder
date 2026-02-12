import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-serif font-bold text-rose-600">
          Valentine Gift Builder
        </h1>
        <p className="text-rose-400">
          Create a simple, heartfelt virtual Valentine experience and share it
          with a unique link.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3 text-white font-medium shadow-lg hover:shadow-xl transition"
        >
          Start Creating
        </Link>
      </div>
    </div>
  );
}

