"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChoiceGrid, DifficultyBadge, Header, Leaderboard, Podium, TimerRing, useCountdown } from "@/components/ui";
import { postJSON, readLocal, useGame } from "@/components/useGame";
import { DIFFICULTY_INFO } from "@/lib/quiz";

interface Me {
  playerId: string;
  name: string;
}

export default function PlayPage() {
  const { pin } = useParams<{ pin: string }>();
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  useEffect(() => setMe(readLocal<Me>(`player:${pin}`)), [pin]);
  useEffect(() => {
    if (me === null) router.replace(`/join?pin=${pin}`);
  }, [me, pin, router]);

  if (!me) return null;
  return <PlayerGame pin={pin} me={me} />;
}

function PlayerGame({ pin, me }: { pin: string; me: Me }) {
  const router = useRouter();
  const { state, error, refresh, toLocal } = useGame(pin, { playerId: me.playerId });
  const [picked, setPicked] = useState<{ index: number; choice: number } | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const q = state?.question ?? null;
  const msLeft = useCountdown(q && state?.phase === "question" ? toLocal(q.endsAt) : null);
  const msToStart = useCountdown(q && state?.phase === "countdown" ? toLocal(q.startsAt) : null);

  if (!state) {
    return <main className="flex min-h-screen items-center justify-center text-xl font-bold">{error ?? "Connecting…"}</main>;
  }

  if (!state.me) {
    return (
      <main className="mx-auto max-w-md p-6 text-center">
        <Header />
        <p className="mt-10 text-xl font-bold">You&apos;re not in this game anymore.</p>
        <button
          type="button"
          className="mt-4 underline"
          onClick={() => {
            try {
              localStorage.removeItem(`player:${pin}`);
            } catch {}
            router.replace(`/join?pin=${pin}`);
          }}
        >
          Join again
        </button>
      </main>
    );
  }

  const my = state.me;
  const myChoice = my.answer ?? (picked && picked.index === state.index ? picked.choice : null);

  const answer = async (choice: number) => {
    if (myChoice !== null) return;
    setPicked({ index: state.index, choice });
    setAnswerError(null);
    try {
      await postJSON(`/api/games/${pin}/answer`, { playerId: me.playerId, index: state.index, choice });
    } catch (e) {
      setAnswerError((e as Error).message);
    }
    refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col pb-24">
      <Header
        right={
          <span className="rounded-lg bg-white/15 px-3 py-1 text-sm font-bold">
            PIN {pin}
          </span>
        }
      />
      {error && <p className="mx-4 mb-3 rounded-lg bg-red-600 px-4 py-2 text-center font-bold">{error}</p>}

      {state.phase === "lobby" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-3xl font-black">You&apos;re in!</p>
          <p className="text-lg text-white/80">See your nickname on the host&apos;s screen?</p>
          <p className="text-sm text-white/70">
            {state.lessonTitle} · {state.modeLabel} · {state.total} questions
          </p>
          <p className="animate-pulse font-bold">Waiting for the host to start… ({state.playerCount} joined)</p>
        </section>
      )}

      {q && state.phase === "countdown" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-5 px-4 text-center">
          {q.newRound && (
            <p className="animate-pop text-2xl font-black text-yellow-300">
              {DIFFICULTY_INFO[q.difficulty].emoji} {DIFFICULTY_INFO[q.difficulty].label} round
            </p>
          )}
          <p className="text-xl font-bold">
            Question {state.index + 1} of {state.total}
          </p>
          <p className="text-2xl font-black">Get ready!</p>
          <div className="animate-pop flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl font-black text-brand">
            {Math.max(1, Math.ceil(msToStart / 1000))}
          </div>
        </section>
      )}

      {q && state.phase === "question" && (
        <section className="flex flex-1 flex-col gap-4 px-4">
          <div className="flex items-center gap-4">
            <TimerRing msLeft={msLeft} total={q.timeLimit} />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2 text-sm font-bold text-white/75">
                {state.index + 1} / {state.total} <DifficultyBadge difficulty={q.difficulty} />
              </div>
              <h2 className="text-xl font-black sm:text-2xl">{q.text}</h2>
            </div>
          </div>
          {myChoice === null ? (
            <ChoiceGrid choices={q.choices} onPick={answer} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="animate-pop text-3xl font-black">{answerError ? "😬" : "Answer locked in!"}</p>
              <p className="text-white/80">{answerError ?? "Waiting for the others…"}</p>
              <p className="text-sm text-white/60">
                {state.answeredCount} of {state.playerCount} answered
              </p>
            </div>
          )}
        </section>
      )}

      {q && state.phase === "reveal" && (
        <section className="flex flex-1 flex-col gap-4 px-4">
          {(() => {
            const r = my.result;
            const verdict = r?.correct ? "Correct!" : myChoice === null ? "Time's up!" : "Incorrect";
            const color = r?.correct ? "bg-[#26890c]" : "bg-[#e21b3c]";
            return (
              <div className={`animate-pop rounded-2xl p-6 text-center ${color}`}>
                <p className="text-4xl font-black">{verdict}</p>
                <p className="mt-2 text-2xl font-extrabold">+{(r?.points ?? 0).toLocaleString()}</p>
                <p className="mt-2 font-bold">
                  {my.rank ? `You're #${my.rank} of ${state.playerCount}` : ""} · {my.score?.toLocaleString() ?? 0} pts
                </p>
              </div>
            );
          })()}
          <h2 className="text-lg font-bold">{q.text}</h2>
          <ChoiceGrid choices={q.choices} answer={q.answer} picked={myChoice} distribution={q.distribution} />
          {q.explanation && (
            <div className="rounded-xl bg-black/30 p-4">
              <p className="mb-1 text-sm font-extrabold uppercase tracking-wider text-yellow-300">Why?</p>
              <p>{q.explanation}</p>
            </div>
          )}
          <p className="text-center text-sm text-white/70">Waiting for the host to continue…</p>
        </section>
      )}

      {state.phase === "finished" && (
        <section className="flex flex-1 flex-col items-center gap-6 px-4 pt-4">
          <h2 className="text-3xl font-black">🏆 Final ranking</h2>
          <p className="text-xl font-bold">
            You placed #{my.rank} of {state.playerCount} with {my.score?.toLocaleString()} pts ({my.correct}/{state.total} correct)
          </p>
          <Podium rows={state.leaderboard} />
          <Leaderboard rows={state.leaderboard} title="Everyone" total={state.total} />
          <Link href="/" className="font-bold underline">
            Back to home
          </Link>
        </section>
      )}

      <footer className="fixed inset-x-0 bottom-0 flex items-center justify-between bg-white px-4 py-3 font-extrabold text-black">
        <span className="truncate">{my.name}</span>
        <span className="rounded bg-[#333] px-3 py-1 text-white">{(my.score ?? 0).toLocaleString()}</span>
      </footer>
    </main>
  );
}
