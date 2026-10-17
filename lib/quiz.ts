import type { Difficulty, DifficultyMode, PreparedQuestion, Question } from "./types";

export const DIFFICULTY_INFO: Record<DifficultyMode, { label: string; blurb: string; emoji: string }> = {
  easy: { label: "Easy", blurb: "Layer names, acronyms, common ports", emoji: "🟢" },
  hard: { label: "Hard", blurb: "Protocol details, IPv4 classes, features", emoji: "🟠" },
  tricky: { label: "Tricky", blurb: "Troubleshooting scenarios & traps", emoji: "🟣" },
  full: { label: "Full Challenge", blurb: "Easy → Hard → Tricky rounds", emoji: "🔥" },
};

export const TIME_LIMITS: Record<Difficulty, number> = { easy: 20, hard: 25, tricky: 30 };
export const BASE_POINTS: Record<Difficulty, number> = { easy: 1000, hard: 1500, tricky: 2000 };
export const ROUND_ORDER: Difficulty[] = ["easy", "hard", "tricky"];

export const COUNT_OPTIONS = [10, 20, 30, 40] as const;

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function poolFor(bank: Question[], mode: DifficultyMode): Question[] {
  return mode === "full" ? bank : bank.filter((q) => q.difficulty === mode);
}

/** Item-count choices available for a mode, plus "all". */
export function countOptions(bank: Question[], mode: DifficultyMode): { value: number; label: string }[] {
  const max = poolFor(bank, mode).length;
  const opts: { value: number; label: string }[] = COUNT_OPTIONS.filter((n) => n < max).map((n) => ({
    value: n,
    label: String(n),
  }));
  opts.push({ value: max, label: `All ${max}` });
  return opts;
}

/** Wordy questions (situations, code) get a flat 40 seconds so the timer measures thinking, not reading. */
export const WORDY_WORDS = 30;
export const WORDY_TIME = 40;

export function timeLimitFor(q: Pick<Question, "question" | "choices" | "difficulty">): number {
  const words = `${q.question} ${q.choices.join(" ")}`.split(/\s+/).filter(Boolean).length;
  const base = TIME_LIMITS[q.difficulty];
  return words >= WORDY_WORDS ? Math.max(base, WORDY_TIME) : base;
}

function prepare(q: Question): PreparedQuestion {
  const order = q.fixedOrder ? q.choices.map((_, i) => i) : shuffle(q.choices.map((_, i) => i));
  return {
    id: q.id,
    difficulty: q.difficulty,
    question: q.question,
    choices: order.map((i) => q.choices[i]),
    answer: order.indexOf(q.answer),
    explanation: q.explanation,
    timeLimit: timeLimitFor(q),
  };
}

/**
 * Draw a fresh, shuffled quiz from the bank. Every call gives a new question
 * selection, a new question order and new choice order.
 * In "full" mode the quiz is split into Easy → Hard → Tricky rounds.
 */
export function buildQuiz(bank: Question[], mode: DifficultyMode, count: number): PreparedQuestion[] {
  if (mode !== "full") {
    return shuffle(poolFor(bank, mode)).slice(0, count).map(prepare);
  }
  const pools = ROUND_ORDER.map((d) => shuffle(bank.filter((q) => q.difficulty === d)));
  const total = Math.min(
    count,
    pools.reduce((n, p) => n + p.length, 0),
  );
  // Split as evenly as possible; earlier rounds get the remainder.
  const want = ROUND_ORDER.map((_, i) => Math.floor(total / 3) + (i < total % 3 ? 1 : 0));
  // If a round's pool is too small, push the shortfall to the other rounds.
  let shortfall = 0;
  want.forEach((w, i) => {
    if (w > pools[i].length) {
      shortfall += w - pools[i].length;
      want[i] = pools[i].length;
    }
  });
  for (let i = 0; shortfall > 0 && i < 3; i++) {
    const extra = Math.min(shortfall, pools[i].length - want[i]);
    want[i] += extra;
    shortfall -= extra;
  }
  return ROUND_ORDER.flatMap((_, i) => pools[i].slice(0, want[i]).map(prepare));
}

/** Kahoot-style scoring: full points for an instant answer, down to half at the buzzer. */
export function scoreAnswer(difficulty: Difficulty, correct: boolean, elapsedMs: number, timeLimitSec: number): number {
  if (!correct) return 0;
  const ratio = Math.min(Math.max(elapsedMs / (timeLimitSec * 1000), 0), 1);
  return Math.round(BASE_POINTS[difficulty] * (1 - ratio / 2));
}

export const CHOICE_STYLES = [
  { bg: "bg-choice-1", shape: "triangle", name: "Terracotta" },
  { bg: "bg-choice-2", shape: "diamond", name: "Slate" },
  { bg: "bg-choice-3", shape: "circle", name: "Ochre" },
  { bg: "bg-choice-4", shape: "square", name: "Olive" },
] as const;
