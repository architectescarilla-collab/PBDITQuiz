"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChoiceGrid,
  DifficultyBadge,
  Header,
  Leaderboard,
  Podium,
  PrimaryButton,
  TimerRing,
  useCountdown,
} from "@/components/ui";
import { postJSON, readLocal, useGame } from "@/components/useGame";
import { DIFFICULTY_INFO } from "@/lib/quiz";

export default function HostGamePage() {
  const { pin } = useParams<{ pin: string }>();
  const [hostKey, setHostKey] = useState<string | null | undefined>(undefined);
  useEffect(() => setHostKey(readLocal<string>(`host:${pin}`)), [pin]);

  if (hostKey === undefined) return null;
  if (!hostKey) {
    return (
      <main className="mx-auto max-w-xl p-6 text-center">
        <Header />
        <p className="mt-10 text-xl font-bold">This browser isn&apos;t the host of game {pin}.</p>
        <Link href={`/join?pin=${pin}`} className="mt-4 inline-block underline">
          Join as a player instead
        </Link>
      </main>
    );
  }
  return <HostGame pin={pin} hostKey={hostKey} />;
}

function HostGame({ pin, hostKey }: { pin: string; hostKey: string }) {
  const { state, error, refresh, toLocal } = useGame(pin, { hostKey });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const q = state?.question ?? null;
  const msLeft = useCountdown(q && state?.phase === "question" ? toLocal(q.endsAt) : null);
  const msToStart = useCountdown(q && state?.phase === "countdown" ? toLocal(q.startsAt) : null);

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center text-xl font-bold">
        {error ?? "Loading game…"}
      </main>
    );
  }

  const advance = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await postJSON(`/api/games/${pin}/advance`, { phase: state.phase, index: state.index }, { "x-host-key": hostKey });
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const joinUrl = `${origin}/join?pin=${pin}`;
  const isLast = state.index + 1 >= state.total;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col pb-10">
      <Header
        right={
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="rounded-lg bg-cream/15 px-3 py-1">PIN {pin}</span>
            <span className="rounded-lg bg-cream/15 px-3 py-1">👥 {state.playerCount}</span>
          </div>
        }
      />
      {(error || actionError) && (
        <p className="mx-4 mb-3 rounded-lg bg-bad px-4 py-2 text-center font-bold">{actionError ?? error}</p>
      )}

      {state.phase === "lobby" && (
        <section className="flex flex-1 flex-col items-center gap-8 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-paper p-6 text-center text-ink shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-ink/60">
              Join at <span className="text-clay">{origin.replace(/^https?:\/\//, "")}</span> with Game PIN:
            </p>
            <p className="my-2 text-6xl font-black tracking-[0.15em] sm:text-8xl">{pin}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <code className="max-w-full truncate rounded bg-sand/40 px-3 py-2 text-sm">{joinUrl}</code>
              <button
                type="button"
                className="rounded bg-clay px-3 py-2 text-sm font-bold text-cream"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(joinUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    /* clipboard blocked */
                  }
                }}
              >
                {copied ? "Copied!" : "Copy invite link"}
              </button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-cream/80">
              {state.topicTitle} · {state.lessonTitle}
            </p>
            <p className="font-bold">
              {state.modeLabel} · {state.total} questions
            </p>
          </div>
          <div className="flex w-full max-w-3xl flex-wrap justify-center gap-2">
            {state.leaderboard.map((p) => (
              <span key={p.name} className="animate-pop rounded-lg bg-paper/90 px-4 py-2 font-extrabold text-ink">
                {p.name}
              </span>
            ))}
            {state.playerCount === 0 && <p className="text-cream/70">Waiting for players…</p>}
          </div>
          <PrimaryButton onClick={advance} disabled={busy || state.playerCount === 0}>
            Start game
          </PrimaryButton>
        </section>
      )}

      {q && state.phase === "countdown" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          {q.newRound && (
            <p className="animate-pop text-2xl font-black text-accent">
              {DIFFICULTY_INFO[q.difficulty].emoji} {DIFFICULTY_INFO[q.difficulty].label} round
            </p>
          )}
          <p className="text-lg font-bold text-cream/80">
            Question {state.index + 1} of {state.total}
          </p>
          <h2 className="max-w-4xl text-3xl font-black sm:text-5xl">{q.text}</h2>
          <div className="animate-pop flex h-24 w-24 items-center justify-center rounded-full bg-paper text-5xl font-black text-clay">
            {Math.max(1, Math.ceil(msToStart / 1000))}
          </div>
        </section>
      )}

      {q && (state.phase === "question" || state.phase === "reveal") && (
        <section className="flex flex-1 flex-col gap-5 px-4">
          <div className="rounded-xl bg-paper px-6 py-5 text-center text-ink shadow-xl">
            <div className="mb-2 flex items-center justify-center gap-3 text-sm font-bold text-ink/60">
              <span>
                {state.index + 1} / {state.total}
              </span>
              <DifficultyBadge difficulty={q.difficulty} />
            </div>
            <h2 className="text-2xl font-black sm:text-4xl">{q.text}</h2>
          </div>

          <div className="flex items-center justify-between">
            {state.phase === "question" ? (
              <TimerRing msLeft={msLeft} total={q.timeLimit} />
            ) : (
              <span className="text-xl font-black">
                {state.answeredCount >= state.playerCount ? "All answers in!" : "Time's up!"}
              </span>
            )}
            <div className="text-center">
              <div className="text-4xl font-black">{state.answeredCount}</div>
              <div className="text-sm font-bold text-cream/75">of {state.playerCount} answered</div>
            </div>
            <PrimaryButton onClick={advance} disabled={busy}>
              {state.phase === "question" ? "Skip" : isLast ? "Final results" : "Next"}
            </PrimaryButton>
          </div>

          <ChoiceGrid choices={q.choices} answer={q.answer} distribution={q.distribution} large />

          {state.phase === "reveal" && (
            <div className="grid gap-5 md:grid-cols-2">
              {q.explanation && (
                <div className="rounded-xl bg-umber-dark/30 p-5">
                  <p className="mb-1 text-sm font-extrabold uppercase tracking-wider text-accent">Why?</p>
                  <p className="text-lg">{q.explanation}</p>
                </div>
              )}
              <Leaderboard rows={state.leaderboard} title="Top 5" />
            </div>
          )}
        </section>
      )}

      {state.phase === "finished" && (
        <section className="flex flex-1 flex-col items-center gap-8 px-4 pt-6">
          <h2 className="text-4xl font-black">🏆 Final ranking</h2>
          <Podium rows={state.leaderboard} />
          <div className="w-full max-w-2xl">
            <Leaderboard rows={state.leaderboard} title="Everyone" total={state.total} />
          </div>
          <Link
            href="/host"
            className="rounded-lg bg-umber px-6 py-3 text-lg font-extrabold text-cream shadow-[0_4px_0_var(--color-umber-dark)] hover:bg-umber-dark"
          >
            Host another game
          </Link>
        </section>
      )}
    </main>
  );
}
