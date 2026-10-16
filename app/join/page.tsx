"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Header, PrimaryButton } from "@/components/ui";
import { postJSON, readLocal, writeLocal } from "@/components/useGame";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState(() => (params.get("pin") ?? "").replace(/\D/g, "").slice(0, 6));
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="w-full max-w-sm space-y-3 rounded-2xl bg-paper p-5 text-ink shadow-2xl"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          // Already joined this game in this browser? Go straight back in.
          const existing = readLocal<{ playerId: string }>(`player:${pin}`);
          if (existing?.playerId) {
            router.push(`/play/${pin}`);
            return;
          }
          const res = await postJSON<{ playerId: string; name: string }>(`/api/games/${pin}/join`, { name });
          writeLocal(`player:${pin}`, res);
          router.push(`/play/${pin}`);
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <input
        inputMode="numeric"
        placeholder="Game PIN"
        aria-label="Game PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full rounded-lg border-2 border-sand px-4 py-3 text-center text-2xl font-black tracking-[0.3em] outline-none focus:border-clay"
      />
      <input
        placeholder="Nickname"
        aria-label="Nickname"
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border-2 border-sand px-4 py-3 text-center text-xl font-bold outline-none focus:border-clay"
      />
      {error && <p className="text-center text-sm font-bold text-bad">{error}</p>}
      <PrimaryButton type="submit" disabled={busy || pin.length !== 6 || !name.trim()} className="w-full">
        {busy ? "Joining…" : "OK, go!"}
      </PrimaryButton>
    </form>
  );
}

export default function JoinPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-45px)] max-w-5xl flex-col">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-4xl font-black">Join a game</h1>
        <Suspense>
          <JoinForm />
        </Suspense>
      </div>
    </main>
  );
}
