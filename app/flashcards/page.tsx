"use client";

import Link from "next/link";
import { RichText } from "@/components/RichText";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QuizSetup, type SetupResult } from "@/components/QuizSetup";
import { DifficultyBadge, Header, PrimaryButton } from "@/components/ui";
import { readLocal, writeLocal } from "@/components/useGame";
import { DIFFICULTY_INFO, poolFor, shuffle } from "@/lib/quiz";
import type { Question } from "@/lib/types";

const progressKey = (s: SetupResult) => `cards:${s.topic.id}:${s.lesson.id}`;

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-bold select-none">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-accent" : "bg-cream/25"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      {label}
    </label>
  );
}

export default function FlashcardsPage() {
  const [setup, setSetup] = useState<SetupResult | null>(null);

  return (
    <main className="mx-auto min-h-screen max-w-4xl pb-16">
      <Header
        right={
          setup && (
            <button type="button" onClick={() => setSetup(null)} className="text-sm font-bold underline">
              Change set
            </button>
          )
        }
      />
      <div className="px-4 sm:px-6">
        {!setup ? (
          <>
            <h1 className="mb-1 text-3xl font-black">Flashcards</h1>
            <p className="mb-6 text-cream/75">Flip, sort and review at your own pace, no timer.</p>
            <QuizSetup
              variant="flashcards"
              submitLabel="Study these cards"
              onSubmit={(r) => {
                setSetup(r);
                window.scrollTo({ top: 0 });
              }}
            />
          </>
        ) : (
          <Study key={`${setup.lesson.id}:${setup.mode}`} setup={setup} />
        )}
      </div>
    </main>
  );
}

function Study({ setup }: { setup: SetupResult }) {
  const all = useMemo(() => poolFor(setup.lesson.questions ?? [], setup.mode), [setup]);

  const [shuffled, setShuffled] = useState(false);
  const [answerFirst, setAnswerFirst] = useState(false);
  const [showChoices, setShowChoices] = useState(true);
  const [tracking, setTracking] = useState(true);

  const [deck, setDeck] = useState<Question[]>(all);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learning, setLearning] = useState<string[]>([]); // "still learning" this round
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  // Remember which cards you know, per lesson, on this device.
  useEffect(() => {
    setKnown(new Set(readLocal<string[]>(progressKey(setup)) ?? []));
  }, [setup]);
  const saveKnown = (next: Set<string>) => {
    setKnown(next);
    writeLocal(progressKey(setup), [...next]);
  };

  const restart = useCallback(
    (cards: Question[], doShuffle = shuffled) => {
      setDeck(doShuffle ? shuffle(cards) : cards);
      setI(0);
      setFlipped(false);
      setLearning([]);
      setDone(false);
    },
    [shuffled],
  );

  const card = deck[i];
  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      if (i + delta >= deck.length) {
        if (tracking) setDone(true);
        return;
      }
      setI((n) => Math.max(0, Math.min(deck.length - 1, n + delta)));
    },
    [i, deck.length, tracking],
  );

  const mark = useCallback(
    (knowIt: boolean) => {
      if (!card) return;
      const next = new Set(known);
      if (knowIt) next.add(card.id);
      else {
        next.delete(card.id);
        setLearning((l) => [...l, card.id]);
      }
      saveKnown(next);
      go(1);
    },
    [card, known, go],
  );

  // Keyboard: Space/↑/↓ flip · ←/→ navigate (or sort when tracking progress).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || (e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") tracking ? mark(true) : go(1);
      else if (e.key === "ArrowLeft") tracking ? mark(false) : go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, tracking, mark, go]);

  const learningCards = all.filter((q) => learning.includes(q.id));
  const answerText = (q: Question) => q.choices[q.answer];

  const front = card && <FaceQuestion q={card} showChoices={showChoices} />;
  const back = card && <FaceAnswer q={card} answer={answerText(card)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-accent">
            {setup.lesson.title} · {setup.mode === "full" ? "All cards" : DIFFICULTY_INFO[setup.mode].label}
          </p>
          <h1 className="text-2xl font-black">{setup.lesson.subtitle}</h1>
        </div>
        <p className="text-sm font-bold text-cream/70">
          You know {all.filter((q) => known.has(q.id)).length} of {all.length}
        </p>
      </div>

      {!done && card && (
        <>
          {/* Progress */}
          <div>
            <div className="mb-1 flex justify-between text-sm font-bold text-cream/75">
              <span>{tracking ? <span className="text-bad-soft">Still learning {learning.length}</span> : "Card"}</span>
              <span>
                {i + 1} / {deck.length}
              </span>
              <span>{tracking ? <span className="text-good-soft">Know {i - learning.length}</span> : ""}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-cream/15">
              <div className="h-full bg-accent transition-all" style={{ width: `${(i / deck.length) * 100}%` }} />
            </div>
          </div>

          {/* The card */}
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show question" : "Show answer"}
            className="block w-full [perspective:1400px]"
          >
            <div
              className="relative min-h-80 w-full transition-transform duration-500 [transform-style:preserve-3d] sm:min-h-96"
              style={{ transform: flipped ? "rotateX(180deg)" : "none" }}
            >
              <div className="absolute inset-0 flex flex-col rounded-2xl bg-paper p-6 text-ink shadow-xl [backface-visibility:hidden] sm:p-10">
                {answerFirst ? back : front}
              </div>
              <div className="absolute inset-0 flex flex-col rounded-2xl bg-paper p-6 text-ink shadow-xl [backface-visibility:hidden] [transform:rotateX(180deg)] sm:p-10">
                {answerFirst ? front : back}
              </div>
            </div>
          </button>
          <p className="-mt-3 text-center text-xs text-cream/60">
            Tap the card or press Space to flip · {tracking ? "← still learning · → know it" : "← → to move"}
          </p>

          {/* Controls */}
          {tracking ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => mark(false)}
                className="rounded-xl border-2 border-bad-soft/60 bg-bad/25 py-4 text-lg font-extrabold transition hover:bg-bad/40"
              >
                ✗ Still learning
              </button>
              <button
                type="button"
                onClick={() => mark(true)}
                className="rounded-xl border-2 border-good-soft/60 bg-good/30 py-4 text-lg font-extrabold transition hover:bg-good/45"
              >
                ✓ Know it
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={i === 0}
                aria-label="Previous card"
                className="h-14 w-14 rounded-full border-2 border-cream/30 text-2xl font-black transition hover:bg-cream/10 disabled:opacity-30"
              >
                ←
              </button>
              <span className="font-bold tabular-nums">
                {i + 1} / {deck.length}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={i === deck.length - 1}
                aria-label="Next card"
                className="h-14 w-14 rounded-full border-2 border-cream/30 text-2xl font-black transition hover:bg-cream/10 disabled:opacity-30"
              >
                →
              </button>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl bg-cream/5 p-4">
            <Toggle on={tracking} onChange={setTracking} label="Track progress" />
            <Toggle
              on={shuffled}
              onChange={(v) => {
                setShuffled(v);
                restart(deck.length === all.length ? all : deck, v);
              }}
              label="Shuffle"
            />
            <Toggle on={showChoices} onChange={setShowChoices} label="Show choices" />
            <Toggle
              on={answerFirst}
              onChange={(v) => {
                setAnswerFirst(v);
                setFlipped(false);
              }}
              label="Answer first"
            />
          </div>
        </>
      )}

      {done && (
        <div className="space-y-5 rounded-2xl bg-paper p-6 text-center text-ink shadow-xl sm:p-10">
          <p className="text-4xl">{learningCards.length === 0 ? "🌿" : "📚"}</p>
          <h2 className="text-3xl font-black">
            {learningCards.length === 0 ? "You know every card in this round!" : "Nice work, keep going!"}
          </h2>
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-xl bg-good/15 p-4">
              <div className="text-3xl font-black text-good">{deck.length - learningCards.length}</div>
              <div className="text-sm font-bold text-ink/70">Know</div>
            </div>
            <div className="rounded-xl bg-bad/15 p-4">
              <div className="text-3xl font-black text-bad">{learningCards.length}</div>
              <div className="text-sm font-bold text-ink/70">Still learning</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {learningCards.length > 0 && (
              <PrimaryButton onClick={() => restart(learningCards)}>
                Review {learningCards.length} still-learning card{learningCards.length === 1 ? "" : "s"}
              </PrimaryButton>
            )}
            <PrimaryButton onClick={() => restart(all)} className="bg-clay">
              Restart all {all.length} cards
            </PrimaryButton>
          </div>
          <p className="text-sm text-ink/60">
            Ready to test yourself?{" "}
            <Link href="/practice" className="font-bold text-clay underline">
              Take the timed quiz
            </Link>
          </p>
        </div>
      )}

      {/* Everything in this set, like Quizlet's term list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black">Cards in this set ({all.length})</h2>
          {known.size > 0 && (
            <button
              type="button"
              className="text-sm font-bold text-cream/70 underline"
              onClick={() => saveKnown(new Set([...known].filter((id) => !all.some((q) => q.id === id))))}
            >
              Reset progress
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {all.map((q) => (
            <li key={q.id} className="grid gap-2 rounded-xl bg-paper p-4 text-ink sm:grid-cols-[3fr_2fr] sm:gap-6">
              <RichText text={q.question} className="font-semibold" />
              <p className="flex items-start gap-2 font-bold text-clay sm:border-l sm:border-sand sm:pl-6">
                {known.has(q.id) && (
                  <span title="You know this" className="text-good">
                    ✓
                  </span>
                )}
                <RichText text={answerText(q)} />
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FaceQuestion({ q, showChoices }: { q: Question; showChoices: boolean }) {
  // The bank lists the correct answer first, so shuffle the hints (keep True/False in order).
  const choices = useMemo(() => (q.fixedOrder ? q.choices : shuffle(q.choices)), [q]);
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-ink/50">Question</span>
        <DifficultyBadge difficulty={q.difficulty} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4 text-center">
        <RichText text={q.question} className="w-full text-2xl leading-snug font-bold sm:text-3xl" />
        {showChoices && (
          <ul className="flex flex-wrap justify-center gap-2">
            {choices.map((c) => (
              <li
                key={c}
                className="rounded-full border border-sand bg-sand/30 px-3 py-1 text-sm font-semibold text-ink/80"
              >
                <RichText text={c} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function FaceAnswer({ q, answer }: { q: Question; answer: string }) {
  return (
    <>
      <span className="text-xs font-extrabold uppercase tracking-wider text-ink/50">Answer</span>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
        <RichText text={answer} className="text-3xl font-black text-clay sm:text-4xl" />
        <RichText text={q.explanation} className="max-w-xl text-base text-ink/75 sm:text-lg" />
      </div>
    </>
  );
}
