import Link from "next/link";

const features = [
  {
    title: "Reasons I Love You",
    description: "A virtual chocolate box—each piece reveals a reason you love them. Sweet, personal, and unforgettable.",
    icon: "🍫",
  },
  {
    title: "Perfect Match",
    description: "Match questions with answers in a fun quiz. Perfect for inside jokes and “how well do you know me?” moments.",
    icon: "💕",
  },
  {
    title: "Letter Scramble",
    description: "Unscramble words to reveal secret messages. A little puzzle, a lot of love.",
    icon: "🔤",
  },
  {
    title: "Word Search",
    description: "Hide words in a grid for them to find. Each word can unlock a message or memory.",
    icon: "🔍",
  },
  {
    title: "Photo Gallery - Coming Soon",
    description: "A beautiful carousel of your favorite photos together. Set the mood before the rest of the surprise.",
    icon: "🖼️",
  },
  {
    title: "Memory Match - Coming Soon",
    description: "A cute memory game using your own photos. Play together and relive your moments.",
    icon: "🧩",
  },
];

const steps = [
  {
    step: 1,
    title: "Pick your theme",
    description: "Choose colors that feel like you—soft pinks, deep roses, or something bold.",
  },
  {
    step: 2,
    title: "Add up to 3 activities",
    description: "Mix and match galleries, games, and surprises. No coding, no design skills needed.",
  },
  {
    step: 3,
    title: "Write your note",
    description: "Add a title, your message, and sign it. This is the heart of the gift.",
  },
  {
    step: 4,
    title: "Share one link",
    description: "We generate a unique link. Send it to your recipient—they open it and enjoy.",
  },
];

const upcoming = [
  "More activity types (trivia, timelines, playlists)",
  "Custom themes and fonts",
  "Optional reminder: “Send this on the big day” (Valentine’s, anniversary, etc.)",
  "Print-friendly version of your note",
  "Multi-language support",
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,113,133,0.15),transparent)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-rose-800 sm:text-5xl md:text-6xl">
            Virtual Gifts They’ll Love
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-rose-600/90 sm:text-xl">
            FromMe is a virtual interactive gift builder. Create a personal experience in minutes—photos, games, and a heartfelt note—then share one link. Perfect for Valentine’s, anniversaries, and special occasions. No account required to view.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 sm:px-8 sm:py-4 text-base font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-pink-600 hover:shadow-xl min-h-[48px]"
            >
              Create your gift
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border-2 border-rose-300 bg-white/80 px-6 py-3.5 text-base font-medium text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 min-h-[48px]"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-rose-100 bg-white/60 px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rose-800 sm:text-4xl">
            Pack your gift with meaning
          </h2>
          <p className="mt-3 max-w-2xl text-rose-600">
            Mix and match activities. Each one is easy to set up—you just add your photos, words, or questions.
          </p>
          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:border-rose-200 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>{f.icon}</span>
                <h3 className="mt-3 font-serif text-lg font-semibold text-rose-800">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-rose-600/90">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-rose-100 px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rose-800 sm:text-4xl">
            How easy it is
          </h2>
          <p className="mt-3 text-rose-600">
            Four steps. No design skills. No account needed for your recipient to open the link.
          </p>
          <ul className="mt-8 sm:mt-12 space-y-8 sm:space-y-10">
            {steps.map((s) => (
              <li key={s.step} className="flex gap-4 sm:gap-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 font-serif text-lg font-semibold text-rose-700">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-rose-800">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-rose-600">{s.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 sm:mt-12 text-center">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 min-h-[48px] text-white font-medium transition hover:bg-rose-600"
            >
              Try it now
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section id="upcoming" className="border-t border-rose-100 bg-rose-50/50 px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rose-800 sm:text-4xl">
            Coming soon
          </h2>
          <p className="mt-3 text-rose-600">
            We’re adding more occasions (anniversaries, birthdays, just because) and more ways to personalize. Here’s what’s on the roadmap.
          </p>
          <ul className="mt-10 space-y-3">
            {upcoming.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-lg border border-rose-100 bg-white/80 px-4 py-3 text-rose-700"
              >
                <span className="text-rose-400" aria-hidden>◦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rose-100 px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rose-800 sm:text-4xl">
            Ready to make their day?
          </h2>
          <p className="mt-3 sm:mt-4 text-rose-600 text-sm sm:text-base">
            Start with a Valentine’s gift, or save the link for anniversaries and more. No sign-up required.
          </p>
          <Link
            href="/create"
            className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-pink-600 hover:shadow-xl min-h-[48px]"
          >
            Start Creating
          </Link>
        </div>
      </section>
    </div>
  );
}
