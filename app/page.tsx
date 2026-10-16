"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header, PrimaryButton } from "@/components/ui";
import { readLocal, writeLocal } from "@/components/useGame";

type Style = "quiz" | "flashcards";

const STYLES: { id: Style; label: string; icon: string }[] = [
  { id: "quiz", label: "Quiz game", icon: "🎮" },
  { id: "flashcards", label: "Flashcards", icon: "🗂️" },
];

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [style, setStyle] = useState<Style>("quiz");
  useEffect(() => {
    const saved = readLocal<Style>("home:style");
    if (saved === "quiz" || saved === "flashcards") setStyle(saved);
  }, []);
  const pick = (s: Style) => {
    setStyle(s);
    writeLocal("home:style", s);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-45px)] max-w-5xl flex-col">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-10">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            PBDIT<span className="text-accent">Quiz!</span>
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-cream/70 sm:text-sm">By BJ Escarilla</p>
          <p className="mt-3 text-lg text-cream/80">
            {style === "quiz"
              ? "Live, timed quizzes with rankings — built from your lessons."
              : "Flip through your lessons at your own pace."}
          </p>
        </div>

        <div role="tablist" aria-label="Study style" className="flex rounded-full bg-umber-dark/60 p-1 shadow-inner">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={style === s.id}
              onClick={() => pick(s.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition sm:px-7 sm:text-base ${
                style === s.id ? "bg-accent text-ink shadow" : "text-cream/75 hover:text-cream"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {style === "flashcards" && (
          <div className="flex w-full max-w-2xl flex-col items-center gap-5">
            <div className="grid w-full gap-3 sm:grid-cols-3">
              {[
                ["🔄", "Flip", "Question on the front, answer and explanation on the back."],
                ["✓", "Sort", "Mark each card Know it or Still learning."],
                ["🔁", "Repeat", "Review only the cards you're still learning."],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-2xl border-2 border-cream/15 bg-cream/5 p-4">
                  <div className="text-2xl">{icon}</div>
                  <div className="mt-1 font-extrabold">{title}</div>
                  <p className="mt-1 text-sm text-cream/70">{text}</p>
                </div>
              ))}
            </div>
            <Link
              href="/flashcards"
              className="rounded-lg bg-umber px-8 py-4 text-lg font-extrabold text-cream shadow-[0_4px_0_var(--color-umber-dark)] transition hover:bg-umber-dark"
            >
              Study flashcards
            </Link>
          </div>
        )}

        {style === "quiz" && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (/^\d{6}$/.test(pin)) router.push(`/join?pin=${pin}`);
              }}
              className="w-full max-w-sm rounded-2xl bg-paper p-5 shadow-2xl"
            >
              <input
                inputMode="numeric"
                autoComplete="off"
                placeholder="Game PIN"
                aria-label="Game PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-lg border-2 border-sand px-4 py-3 text-center text-2xl font-black tracking-[0.3em] text-ink outline-none focus:border-clay"
              />
              <PrimaryButton type="submit" disabled={pin.length !== 6} className="mt-3 w-full">
                Enter
              </PrimaryButton>
            </form>

            <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
              <Link
                href="/host"
                className="rounded-2xl border-2 border-cream/20 bg-cream/10 p-6 transition hover:border-accent hover:bg-cream/15"
              >
                <div className="text-3xl">🎤</div>
                <div className="mt-2 text-xl font-extrabold">Host a live game</div>
                <p className="mt-1 text-sm text-cream/75">
                  Pick a lesson, share the PIN, and race your class with a live ranking.
                </p>
              </Link>
              <Link
                href="/practice"
                className="rounded-2xl border-2 border-cream/20 bg-cream/10 p-6 transition hover:border-accent hover:bg-cream/15"
              >
                <div className="text-3xl">🎯</div>
                <div className="mt-2 text-xl font-extrabold">Practice solo</div>
                <p className="mt-1 text-sm text-cream/75">
                  Same timer and scoring, on your own. Beat your personal best.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
