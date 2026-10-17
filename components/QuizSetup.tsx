"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/catalog";
import { countOptions, DIFFICULTY_INFO, poolFor } from "@/lib/quiz";
import type { DifficultyMode, Lesson, Topic } from "@/lib/types";
import { PrimaryButton } from "./ui";

export interface SetupResult {
  topic: Topic;
  lesson: Lesson;
  mode: DifficultyMode;
  count: number;
}

const MODES: DifficultyMode[] = ["easy", "hard", "tricky", "full"];

function SoonBadge() {
  return (
    <span className="rounded-full bg-umber-dark/40 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-accent">
      Coming soon
    </span>
  );
}

function Option({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-xl border-2 p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-cream/10 bg-cream/5 opacity-60"
          : selected
            ? "border-accent bg-cream/20"
            : "border-cream/20 bg-cream/10 hover:border-cream/50 hover:bg-cream/15"
      }`}
    >
      {children}
    </button>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-3 text-lg font-extrabold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function QuizSetup({
  submitLabel,
  busy,
  onSubmit,
  variant = "quiz",
}: {
  submitLabel: string;
  busy?: boolean;
  onSubmit: (r: SetupResult) => void;
  /** "flashcards" skips the item-count step and studies every card in the chosen set. */
  variant?: "quiz" | "flashcards";
}) {
  const cards = variant === "flashcards";
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [mode, setMode] = useState<DifficultyMode | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const bank = lesson?.questions ?? [];

  return (
    <div className="space-y-8">
      <Step n={1} title="Choose a topic">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => (
            <Option
              key={t.id}
              selected={topic?.id === t.id}
              disabled={t.status !== "available"}
              onClick={() => {
                setTopic(t);
                setLesson(null);
                setMode(null);
                setCount(null);
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-extrabold">{t.title}</span>
                {t.status !== "available" && <SoonBadge />}
              </div>
              <p className="mt-1 text-sm text-cream/75">{t.description}</p>
            </Option>
          ))}
        </div>
      </Step>

      {topic && (
        <Step n={2} title="Choose a lesson">
          <div className="grid gap-3 sm:grid-cols-2">
            {topic.lessons.map((l) => (
              <Option
                key={l.id}
                selected={lesson?.id === l.id}
                disabled={l.status !== "available"}
                onClick={() => {
                  setLesson(l);
                  setMode(null);
                  setCount(null);
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold uppercase tracking-wider text-accent">{l.title}</span>
                  {l.status !== "available" && <SoonBadge />}
                </div>
                <div className="mt-1 text-lg font-bold">{l.subtitle}</div>
                {l.questions && <p className="mt-1 text-sm text-cream/70">{l.questions.length} questions in the bank</p>}
              </Option>
            ))}
          </div>
        </Step>
      )}

      {lesson && (
        <Step n={3} title={cards ? "Which cards?" : "Choose difficulty"}>
          <div className="grid gap-3 sm:grid-cols-4">
            {MODES.map((m) => (
              <Option
                key={m}
                selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setCount(cards ? poolFor(bank, m).length : null);
                }}
              >
                <div className="text-lg font-extrabold">
                  {DIFFICULTY_INFO[m].emoji} {cards && m === "full" ? "All cards" : DIFFICULTY_INFO[m].label}
                </div>
                <p className="mt-1 text-sm text-cream/75">
                  {cards && m === "full" ? "Every card in the lesson" : DIFFICULTY_INFO[m].blurb}
                </p>
                <p className="mt-1 text-xs text-cream/60">
                  {poolFor(bank, m).length} {cards ? "cards" : "available"}
                </p>
              </Option>
            ))}
          </div>
        </Step>
      )}

      {lesson && mode && !cards && (
        <Step n={4} title="How many items?">
          <div className="flex flex-wrap gap-3">
            {countOptions(bank, mode).map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setCount(o.value)}
                aria-pressed={count === o.value}
                className={`min-w-20 rounded-xl border-2 px-5 py-3 text-lg font-extrabold transition ${
                  count === o.value ? "border-accent bg-cream/20" : "border-cream/20 bg-cream/10 hover:border-cream/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Step>
      )}

      <div className="pt-2">
        <PrimaryButton
          disabled={!topic || !lesson || !mode || !count || busy}
          onClick={() => topic && lesson && mode && count && onSubmit({ topic, lesson, mode, count })}
          className="w-full sm:w-auto"
        >
          {busy ? "Please wait…" : submitLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}
