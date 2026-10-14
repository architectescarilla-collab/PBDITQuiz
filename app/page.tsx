"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header, PrimaryButton } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState("");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-10">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            PBDIT<span className="text-yellow-300">Quiz!</span>
          </h1>
          <p className="mt-3 text-lg text-white/80">Live, timed quizzes with rankings — built from your lessons.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (/^\d{6}$/.test(pin)) router.push(`/join?pin=${pin}`);
          }}
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        >
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="Game PIN"
            aria-label="Game PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-center text-2xl font-black tracking-[0.3em] text-black outline-none focus:border-brand"
          />
          <PrimaryButton type="submit" disabled={pin.length !== 6} className="mt-3 w-full">
            Enter
          </PrimaryButton>
        </form>

        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          <Link
            href="/host"
            className="rounded-2xl border-2 border-white/20 bg-white/10 p-6 transition hover:border-yellow-300 hover:bg-white/15"
          >
            <div className="text-3xl">🎤</div>
            <div className="mt-2 text-xl font-extrabold">Host a live game</div>
            <p className="mt-1 text-sm text-white/75">Pick a lesson, share the PIN, and race your class with a live ranking.</p>
          </Link>
          <Link
            href="/practice"
            className="rounded-2xl border-2 border-white/20 bg-white/10 p-6 transition hover:border-yellow-300 hover:bg-white/15"
          >
            <div className="text-3xl">🎯</div>
            <div className="mt-2 text-xl font-extrabold">Practice solo</div>
            <p className="mt-1 text-sm text-white/75">Same timer and scoring, on your own. Beat your personal best.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
