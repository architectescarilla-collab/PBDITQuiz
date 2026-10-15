"use client";

import { useCallback, useEffect, useState } from "react";
import { QuizSetup, type SetupResult } from "@/components/QuizSetup";
import { ChoiceGrid, DifficultyBadge, Header, PrimaryButton, TimerRing, useCountdown } from "@/components/ui";
import { readLocal, writeLocal } from "@/components/useGame";
import { buildQuiz, DIFFICULTY_INFO, scoreAnswer } from "@/lib/quiz";
import type { PreparedQuestion } from "@/lib/types";

const GET_READY_MS = 3000;

type Phase = "setup" | "countdown" | "question" | "reveal" | "finished";

interface AnswerLog {
  q: PreparedQuestion;
  choice: number | null;
  points: number;
}

interface BestScore {
  score: number;
  correct: number;
  total: number;
  date: string;
}

export default function PracticePage() {
  const [setup, setSetup] = useState<SetupResult | null>(null);
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [startsAt, setStartsAt] = useState(0);
  const [log, setLog] = useState<AnswerLog[]>([]);
  const [best, setBest] = useState<BestScore[]>([]);

  const q = questions[index];
  const endsAt = q ? startsAt + q.timeLimit * 1000 : 0;
  const msToStart = useCountdown(phase === "countdown" ? startsAt : null);
  const msLeft = useCountdown(phase === "question" ? endsAt : null);
  const score = log.reduce((n, a) => n + a.points, 0);
  const bestKey = setup ? `best:${setup.topic.id}:${setup.lesson.id}:${setup.mode}:${questions.length}` : "";

  const start = (s: SetupResult) => {
    window.scrollTo({ top: 0 });
    setSetup(s);
    setQuestions(buildQuiz(s.lesson.questions ?? [], s.mode, s.count)); // fresh shuffle every round
    setIndex(0);
    setLog([]);
    setStartsAt(Date.now() + GET_READY_MS);
    setPhase("countdown");
  };

  const lockIn = useCallback(
    (choice: number | null) => {
      if (phase !== "question" || !q) return;
      const elapsed = Date.now() - startsAt;
      const points = choice === null ? 0 : scoreAnswer(q.difficulty, choice === q.answer, elapsed, q.timeLimit);
      setLog((l) => [...l, { q, choice, points }]);
      setPhase("reveal");
    },
    [phase, q, startsAt],
  );

  // Countdown → question, and time's up → reveal.
  useEffect(() => {
    if (phase === "countdown" && msToStart === 0) setPhase("question");
    if (phase === "question" && msLeft === 0 && Date.now() >= endsAt) lockIn(null);
  }, [phase, msToStart, msLeft, endsAt, lockIn]);

  const next = () => {
    if (index + 1 >= questions.length) {
      const entry: BestScore = {
        score,
        correct: log.filter((a) => a.choice === a.q.answer).length,
        total: questions.length,
        date: new Date().toLocaleString(),
      };
      const list = [...(readLocal<BestScore[]>(bestKey) ?? []), entry].sort((a, b) => b.score - a.score).slice(0, 10);
      writeLocal(bestKey, list);
      setBest(list);
      setPhase("finished");
      return;
    }
    setIndex(index + 1);
    setStartsAt(Date.now() + GET_READY_MS);
    setPhase("countdown");
  };

  const last = log[log.length - 1];
  const correctCount = log.filter((a) => a.choice === a.q.answer).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col pb-16">
      <Header
        right={
          phase !== "setup" && (
            <span className="rounded-lg bg-cream/15 px-3 py-1 text-sm font-bold">{score.toLocaleString()} pts</span>
          )
        }
      />
      <div className="flex flex-1 flex-col px-4 sm:px-6">
        {phase === "setup" && (
          <>
            <h1 className="mb-6 text-3xl font-black">Practice solo</h1>
            <QuizSetup submitLabel="Start practice" onSubmit={start} />
          </>
        )}

        {phase === "countdown" && q && (
          <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            {setup?.mode === "full" && (index === 0 || questions[index - 1].difficulty !== q.difficulty) && (
              <p className="animate-pop text-2xl font-black text-accent">
                {DIFFICULTY_INFO[q.difficulty].emoji} {DIFFICULTY_INFO[q.difficulty].label} round
              </p>
            )}
            <p className="text-xl font-bold">
              Question {index + 1} of {questions.length}
            </p>
            <h2 className="max-w-3xl text-3xl font-black">{q.question}</h2>
            <div className="animate-pop flex h-24 w-24 items-center justify-center rounded-full bg-paper text-5xl font-black text-clay">
              {Math.max(1, Math.ceil(msToStart / 1000))}
            </div>
          </section>
        )}

        {(phase === "question" || phase === "reveal") && q && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {phase === "question" ? (
                <TimerRing msLeft={msLeft} total={q.timeLimit} />
              ) : (
                <div
                  className={`animate-pop rounded-xl px-4 py-2 text-center font-black ${
                    last?.choice === q.answer ? "bg-good" : "bg-bad"
                  }`}
                >
                  {last?.choice === q.answer ? `Correct! +${last.points}` : last?.choice === null ? "Time's up!" : "Incorrect"}
                </div>
              )}
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2 text-sm font-bold text-cream/75">
                  {index + 1} / {questions.length} <DifficultyBadge difficulty={q.difficulty} />
                </div>
                <h2 className="text-xl font-black sm:text-2xl">{q.question}</h2>
              </div>
            </div>
            <ChoiceGrid
              choices={q.choices}
              onPick={phase === "question" ? lockIn : undefined}
              answer={phase === "reveal" ? q.answer : null}
              picked={phase === "reveal" ? (last?.choice ?? null) : null}
            />
            {phase === "reveal" && (
              <>
                <div className="rounded-xl bg-umber-dark/30 p-4">
                  <p className="mb-1 text-sm font-extrabold uppercase tracking-wider text-accent">Why?</p>
                  <p>{q.explanation}</p>
                </div>
                <PrimaryButton onClick={next} className="self-end">
                  {index + 1 >= questions.length ? "See results" : "Next"}
                </PrimaryButton>
              </>
            )}
          </section>
        )}

        {phase === "finished" && setup && (
          <section className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-4xl font-black">Round complete!</h2>
            <div className="rounded-2xl bg-paper px-10 py-6 text-ink shadow-xl">
              <div className="text-5xl font-black">{score.toLocaleString()}</div>
              <div className="font-bold text-ink/60">
                {correctCount} / {questions.length} correct · {DIFFICULTY_INFO[setup.mode].label}
              </div>
            </div>

            <div className="w-full max-w-xl text-left">
              <h3 className="mb-2 text-center text-xl font-black">Your best on this device</h3>
              <ol className="space-y-2">
                {best.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg bg-paper px-4 py-2 font-bold text-ink">
                    <span className="w-6 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-ink/60">{b.date}</span>
                    <span className="text-sm text-ink/60">
                      {b.correct}/{b.total}
                    </span>
                    <span className="w-20 text-right">{b.score.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton onClick={() => start(setup)}>Play again (new shuffle)</PrimaryButton>
              <PrimaryButton onClick={() => setPhase("setup")} className="bg-cream/20">
                Change settings
              </PrimaryButton>
            </div>

            {log.some((a) => a.choice !== a.q.answer) && (
              <div className="w-full max-w-2xl text-left">
                <h3 className="mb-2 text-center text-xl font-black">Review your misses</h3>
                <ul className="space-y-3">
                  {log
                    .filter((a) => a.choice !== a.q.answer)
                    .map((a) => (
                      <li key={a.q.id} className="rounded-xl bg-umber-dark/30 p-4">
                        <p className="font-bold">{a.q.question}</p>
                        <p className="mt-1 text-sm">
                          <span className="text-bad-soft">
                            Your answer: {a.choice === null ? "— (no answer)" : a.q.choices[a.choice]}
                          </span>
                          <br />
                          <span className="text-good-soft">Correct: {a.q.choices[a.q.answer]}</span>
                        </p>
                        <p className="mt-1 text-sm text-cream/75">{a.q.explanation}</p>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
