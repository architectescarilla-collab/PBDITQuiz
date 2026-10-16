import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/ui";

export const metadata = { title: "Other Games · PBDIT Quiz" };

const GAMES = [
  {
    href: "/games/flappy-boji",
    title: "Flappy Boji",
    blurb: "Tap to fly between skyscrapers. How many towers can you clear?",
    tag: "Arcade",
    art: "flappy",
  },
  {
    href: "/games/pbdit-kart",
    title: "PBDIT Kart",
    blurb: "Kart racing with Python, HTML, C# and Java. Grab power-ups and race to the line!",
    tag: "Racing",
    art: "kart",
  },
];

export default function GamesPage() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-45px)] max-w-5xl pb-16">
      <Header />
      <div className="px-4 sm:px-6">
        <h1 className="text-3xl font-black">Other Games</h1>
        <p className="mt-1 text-cream/75">Just for fun, no lessons here. Take a break between quizzes.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group overflow-hidden rounded-2xl border-2 border-cream/15 bg-cream/5 transition hover:border-accent"
            >
              {g.art === "kart" ? (
                <div className="relative flex h-44 items-end justify-center gap-2 overflow-hidden bg-gradient-to-b from-[#5fb8f5] to-[#e6f4ff] pb-6">
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-[#9aa6b5]" />
                  <div className="absolute inset-x-0 bottom-3.5 h-1 bg-[repeating-linear-gradient(90deg,#3fd6f5_0_18px,transparent_18px_36px)]" />
                  {["🐍", "🕷️", "🦈", "☕"].map((e, i) => (
                    <span
                      key={e}
                      className="relative text-4xl drop-shadow-md transition group-hover:-translate-y-1"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      {e}
                    </span>
                  ))}
                  <span className="absolute top-3 right-4 text-2xl">🏁</span>
                </div>
              ) : (
                <div className="relative flex h-44 items-end justify-center overflow-hidden bg-gradient-to-b from-[#d9c6a5] to-[#cdb894]">
                  {/* little skyline */}
                  <div className="absolute bottom-0 left-4 h-24 w-10 bg-choice-2" />
                  <div className="absolute bottom-0 left-16 h-16 w-8 bg-choice-1" />
                  <div className="absolute right-6 bottom-0 h-28 w-10 bg-choice-4" />
                  <div className="absolute right-20 bottom-0 h-14 w-8 bg-clay" />
                  <Image
                    src="/games/bj-caricature.png"
                    alt=""
                    width={81}
                    height={160}
                    className="relative mb-3 -rotate-12 drop-shadow-lg transition group-hover:-translate-y-2 group-hover:rotate-0"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold">{g.title}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-ink">{g.tag}</span>
                </div>
                <p className="mt-1 text-sm text-cream/75">{g.blurb}</p>
              </div>
            </Link>
          ))}
          <div className="flex min-h-40 items-center justify-center rounded-2xl border-2 border-dashed border-cream/15 p-6 text-center text-sm font-bold text-cream/50">
            More games coming soon
          </div>
        </div>
      </div>
    </main>
  );
}
