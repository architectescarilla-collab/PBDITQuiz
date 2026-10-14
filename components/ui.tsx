"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHOICE_STYLES, DIFFICULTY_INFO } from "@/lib/quiz";
import type { Difficulty } from "@/lib/types";

export function Shape({ kind, className = "h-7 w-7" }: { kind: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="white">
      {kind === "triangle" && <polygon points="16,3 30,28 2,28" />}
      {kind === "diamond" && <polygon points="16,1 31,16 16,31 1,16" />}
      {kind === "circle" && <circle cx="16" cy="16" r="14" />}
      {kind === "square" && <rect x="3" y="3" width="26" height="26" rx="2" />}
    </svg>
  );
}

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <Link href="/" className="text-xl font-black tracking-tight">
        PBDIT<span className="text-yellow-300">Quiz!</span>
      </Link>
      {right}
    </header>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const color = { easy: "bg-green-600", hard: "bg-orange-600", tricky: "bg-fuchsia-700" }[difficulty];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${color}`}>
      {DIFFICULTY_INFO[difficulty].label}
    </span>
  );
}

/**
 * Four Kahoot-style answer tiles.
 * - `onPick` set → clickable.
 * - `answer` set → reveal mode (wrong ones fade, correct one gets a check).
 */
export function ChoiceGrid({
  choices,
  onPick,
  answer = null,
  picked = null,
  distribution = null,
  disabled = false,
  large = false,
}: {
  choices: string[];
  onPick?: (i: number) => void;
  answer?: number | null;
  picked?: number | null;
  distribution?: number[] | null;
  disabled?: boolean;
  large?: boolean;
}) {
  const revealed = answer !== null;
  const maxCount = distribution ? Math.max(1, ...distribution) : 1;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((text, i) => {
        const style = CHOICE_STYLES[i % CHOICE_STYLES.length];
        const faded = revealed && i !== answer;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled || !onPick}
            onClick={() => onPick?.(i)}
            className={`relative flex items-center gap-3 overflow-hidden rounded-lg px-4 text-left font-bold shadow-[0_4px_0_rgba(0,0,0,0.3)] transition ${style.bg} ${
              large ? "min-h-24 text-xl" : "min-h-16 text-base sm:min-h-20 sm:text-lg"
            } ${faded ? "opacity-35" : ""} ${onPick && !disabled ? "cursor-pointer hover:brightness-110 active:translate-y-0.5 active:shadow-none" : "cursor-default"} ${
              picked === i ? "ring-4 ring-white" : ""
            }`}
          >
            <Shape kind={style.shape} className={large ? "h-9 w-9 shrink-0" : "h-7 w-7 shrink-0"} />
            <span className="flex-1 py-3">{text}</span>
            {revealed && i === answer && <span className="text-3xl">✓</span>}
            {distribution && (
              <span
                className="absolute bottom-0 left-0 h-1.5 bg-white/70"
                style={{ width: `${(distribution[i] / maxCount) * 100}%` }}
                aria-label={`${distribution[i]} answers`}
              />
            )}
            {distribution && <span className="ml-2 rounded bg-black/25 px-2 text-sm">{distribution[i]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Seconds left until `endsAt` (ms, in local clock), re-rendering ~10×/s. */
export function useCountdown(endsAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [endsAt]);
  return endsAt === null ? 0 : Math.max(0, endsAt - now);
}

export function TimerRing({ msLeft, total }: { msLeft: number; total: number }) {
  const secs = Math.ceil(msLeft / 1000);
  const frac = total > 0 ? msLeft / (total * 1000) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0" role="timer" aria-label={`${secs} seconds left`}>
      <svg viewBox="0 0 60 60" className="h-16 w-16 -rotate-90">
        <circle cx="30" cy="30" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
        <circle
          cx="30"
          cy="30"
          r={r}
          stroke={frac < 0.25 ? "#ff3355" : "#fff"}
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">{secs}</span>
    </div>
  );
}

export interface BoardRow {
  name: string;
  score: number;
  correct: number;
  rank: number;
  isMe?: boolean;
}

export function Leaderboard({ rows, title = "Leaderboard", total }: { rows: BoardRow[]; title?: string; total?: number }) {
  return (
    <div className="w-full">
      <h3 className="mb-3 text-center text-2xl font-black">{title}</h3>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={`${r.name}-${i}`}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-bold ${r.isMe ? "bg-yellow-300 text-black" : "bg-white text-black"}`}
          >
            <span className="w-8 text-center text-lg font-black">{r.rank}</span>
            <span className="flex-1 truncate">{r.name}</span>
            {total !== undefined && (
              <span className="text-sm font-semibold text-black/60">
                {r.correct}/{total}
              </span>
            )}
            <span className="w-20 text-right tabular-nums">{r.score.toLocaleString()}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-center text-white/70">No players yet.</li>}
      </ol>
    </div>
  );
}

export function Podium({ rows }: { rows: BoardRow[] }) {
  const slots = [
    { row: rows[1], h: "h-28", medal: "🥈", delay: "0.4s" },
    { row: rows[0], h: "h-40", medal: "🥇", delay: "0.9s" },
    { row: rows[2], h: "h-20", medal: "🥉", delay: "0s" },
  ];
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {slots.map(({ row, h, medal, delay }, i) =>
        row ? (
          <div key={i} className="flex w-28 flex-col items-center sm:w-40">
            <div className="animate-pop mb-2 text-center" style={{ animationDelay: delay }}>
              <div className="text-4xl">{medal}</div>
              <div className="max-w-full truncate text-lg font-black">{row.name}</div>
              <div className="text-sm font-bold text-white/80">{row.score.toLocaleString()} pts</div>
            </div>
            <div className={`animate-rise w-full rounded-t-lg bg-white/90 ${h}`} style={{ animationDelay: delay }} />
          </div>
        ) : (
          <div key={i} className="w-28 sm:w-40" />
        ),
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-6 text-black shadow-xl ${className}`}>{children}</div>;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-lg bg-[#333] px-6 py-3 text-lg font-extrabold text-white shadow-[0_4px_0_#000] transition hover:bg-black active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}
