import "server-only";
import { findLesson } from "./catalog";
import { buildQuiz, DIFFICULTY_INFO, scoreAnswer } from "./quiz";
import { store } from "./store";
import type { DifficultyMode, PreparedQuestion } from "./types";

const TTL = 60 * 60 * 4; // games live for 4 hours
const GET_READY_MS = 3000; // "Get ready…" countdown before each question
const LATENCY_GRACE_MS = 750; // accept answers that were in flight at the buzzer
export const MAX_PLAYERS = 200;

type StoredPhase = "lobby" | "question" | "reveal" | "finished";
export type Phase = StoredPhase | "countdown";

interface Game {
  pin: string;
  hostKey: string;
  topicTitle: string;
  lessonTitle: string;
  mode: DifficultyMode;
  questions: PreparedQuestion[];
  phase: StoredPhase;
  current: number;
  startsAt: number; // when the current question opens for answers
  createdAt: number;
}

interface PlayerRecord {
  name: string;
  joinedAt: number;
}

interface AnswerRecord {
  choice: number;
  elapsedMs: number;
  points: number;
  correct: boolean;
}

export class GameError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const k = {
  game: (pin: string) => `game:${pin}`,
  players: (pin: string) => `game:${pin}:players`,
  names: (pin: string) => `game:${pin}:names`,
  scores: (pin: string) => `game:${pin}:scores`,
  correct: (pin: string) => `game:${pin}:correct`,
  answers: (pin: string, i: number) => `game:${pin}:a:${i}`,
};

async function load(pin: string): Promise<Game> {
  const raw = await store.get(k.game(pin));
  if (!raw) throw new GameError("Game not found. Check the PIN.", 404);
  return JSON.parse(raw) as Game;
}

async function save(game: Game) {
  await store.set(k.game(game.pin), JSON.stringify(game), TTL);
}

function deadline(game: Game) {
  return game.startsAt + game.questions[game.current].timeLimit * 1000;
}

function effectivePhase(game: Game, now: number, answered: number, players: number): Phase {
  if (game.phase !== "question") return game.phase;
  if (now < game.startsAt) return "countdown";
  if (now >= deadline(game) || (players > 0 && answered >= players)) return "reveal";
  return "question";
}

/* ----------------------------- host actions ----------------------------- */

export async function createGame(input: { topicId: string; lessonId: string; mode: DifficultyMode; count: number }) {
  const found = findLesson(input.topicId, input.lessonId);
  if (!found || !found.lesson.questions?.length) throw new GameError("That lesson isn't available yet.");
  if (!(input.mode in DIFFICULTY_INFO)) throw new GameError("Unknown difficulty.");
  const count = Math.max(1, Math.min(Math.floor(input.count) || 10, found.lesson.questions.length));
  const questions = buildQuiz(found.lesson.questions, input.mode, count);
  if (!questions.length) throw new GameError("No questions for that difficulty.");

  for (let attempt = 0; attempt < 10; attempt++) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const game: Game = {
      pin,
      hostKey: crypto.randomUUID(),
      topicTitle: found.topic.title,
      lessonTitle: `${found.lesson.title}: ${found.lesson.subtitle}`,
      mode: input.mode,
      questions,
      phase: "lobby",
      current: 0,
      startsAt: 0,
      createdAt: Date.now(),
    };
    if (await store.setNx(k.game(pin), JSON.stringify(game), TTL)) {
      return { pin, hostKey: game.hostKey };
    }
  }
  throw new GameError("Could not allocate a game PIN, please retry.", 503);
}

/**
 * Host "advance" button: lobby → Q1, question → reveal (skip timer), reveal → next Q / finished.
 * `expect` guards against double-clicks advancing twice.
 */
export async function advance(pin: string, hostKey: string, expect: { phase: Phase; index: number }) {
  const game = await load(pin);
  if (game.hostKey !== hostKey) throw new GameError("Only the host can do that.", 403);
  const now = Date.now();
  const [answered, players] = await Promise.all([store.hlen(k.answers(pin, game.current)), store.hlen(k.players(pin))]);
  const phase = effectivePhase(game, now, answered, players);
  if (phase !== expect.phase || game.current !== expect.index) return; // stale click

  if (phase === "lobby") {
    if (players === 0) throw new GameError("Wait for at least one player to join.");
    game.phase = "question";
    game.current = 0;
    game.startsAt = now + GET_READY_MS;
  } else if (phase === "question" || phase === "countdown") {
    game.phase = "reveal";
  } else if (phase === "reveal") {
    if (game.current + 1 >= game.questions.length) {
      game.phase = "finished";
    } else {
      game.phase = "question";
      game.current += 1;
      game.startsAt = now + GET_READY_MS;
    }
  }
  await save(game);
}

/* ---------------------------- player actions ---------------------------- */

export async function joinGame(pin: string, rawName: string) {
  const name = rawName.replace(/\s+/g, " ").trim().slice(0, 20);
  if (!name) throw new GameError("Please enter a nickname.");
  const game = await load(pin);
  if (game.phase === "finished") throw new GameError("This game has already ended.");
  if ((await store.hlen(k.players(pin))) >= MAX_PLAYERS) throw new GameError("This game is full.");

  const playerId = crypto.randomUUID();
  if (!(await store.hsetNx(k.names(pin), name.toLowerCase(), playerId, TTL))) {
    throw new GameError("That nickname is taken in this game. Try another.", 409);
  }
  const rec: PlayerRecord = { name, joinedAt: Date.now() };
  await Promise.all([
    store.hset(k.players(pin), playerId, JSON.stringify(rec), TTL),
    store.hincrby(k.scores(pin), playerId, 0, TTL),
    store.hincrby(k.correct(pin), playerId, 0, TTL),
  ]);
  return { playerId, name };
}

export async function submitAnswer(pin: string, playerId: string, index: number, choice: number) {
  const game = await load(pin);
  const player = await store.hget(k.players(pin), playerId);
  if (!player) throw new GameError("You are not in this game.", 403);
  if (game.phase !== "question" || game.current !== index) throw new GameError("Too late — that question is closed.", 409);

  const q = game.questions[index];
  const now = Date.now();
  if (now < game.startsAt) throw new GameError("Question hasn't started yet.", 409);
  if (now > deadline(game) + LATENCY_GRACE_MS) throw new GameError("Time's up!", 409);
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.choices.length) throw new GameError("Invalid choice.");

  const elapsedMs = Math.min(now - game.startsAt, q.timeLimit * 1000);
  const correct = choice === q.answer;
  const points = scoreAnswer(q.difficulty, correct, elapsedMs, q.timeLimit);
  const rec: AnswerRecord = { choice, elapsedMs, points, correct };

  // First answer wins; resubmits are ignored.
  if (!(await store.hsetNx(k.answers(pin, index), playerId, JSON.stringify(rec), TTL))) {
    throw new GameError("You already answered.", 409);
  }
  if (correct) {
    await Promise.all([
      store.hincrby(k.scores(pin), playerId, points, TTL),
      store.hincrby(k.correct(pin), playerId, 1, TTL),
    ]);
  }
  return { accepted: true };
}

/* --------------------------------- state -------------------------------- */

export interface RankedPlayer {
  id: string;
  name: string;
  score: number;
  correct: number;
  rank: number;
}

async function leaderboard(pin: string): Promise<RankedPlayer[]> {
  const [players, scores, correct] = await Promise.all([
    store.hgetall(k.players(pin)),
    store.hgetall(k.scores(pin)),
    store.hgetall(k.correct(pin)),
  ]);
  const rows = Object.entries(players).map(([id, raw]) => {
    const p = JSON.parse(raw) as PlayerRecord;
    return { id, name: p.name, joinedAt: p.joinedAt, score: Number(scores[id] ?? 0), correct: Number(correct[id] ?? 0) };
  });
  rows.sort((a, b) => b.score - a.score || b.correct - a.correct || a.joinedAt - b.joinedAt);
  let rank = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.score !== rows[i - 1].score) rank = i + 1;
    return { id: r.id, name: r.name, score: r.score, correct: r.correct, rank };
  });
}

export async function getState(pin: string, opts: { playerId?: string | null; hostKey?: string | null }) {
  const game = await load(pin);
  const isHost = !!opts.hostKey && opts.hostKey === game.hostKey;
  const now = Date.now();
  const [answered, playerCount] = await Promise.all([
    store.hlen(k.answers(pin, game.current)),
    store.hlen(k.players(pin)),
  ]);
  const phase = effectivePhase(game, now, answered, playerCount);
  const q = game.questions[game.current];
  const prev = game.questions[game.current - 1];
  const inQuestion = phase === "countdown" || phase === "question" || phase === "reveal";

  const needBoard = isHost || phase === "lobby" || phase === "reveal" || phase === "finished";
  const board = needBoard ? await leaderboard(pin) : [];

  let me = null;
  if (opts.playerId) {
    const rawPlayer = await store.hget(k.players(pin), opts.playerId);
    if (rawPlayer) {
      const p = JSON.parse(rawPlayer) as PlayerRecord;
      const [rawAns, score, correct] = await Promise.all([
        inQuestion ? store.hget(k.answers(pin, game.current), opts.playerId) : null,
        store.hget(k.scores(pin), opts.playerId),
        store.hget(k.correct(pin), opts.playerId),
      ]);
      const ans = rawAns ? (JSON.parse(rawAns) as AnswerRecord) : null;
      const row = board.find((r) => r.id === opts.playerId);
      me = {
        name: p.name,
        score: Number(score ?? 0),
        correct: Number(correct ?? 0),
        rank: row?.rank ?? null,
        answer: ans ? ans.choice : null,
        // Only reveal correctness/points after the question closes.
        result: ans && (phase === "reveal" || phase === "finished") ? { correct: ans.correct, points: ans.points } : null,
      };
    }
  }

  let distribution: number[] | null = null;
  if (phase === "reveal" && (isHost || opts.playerId)) {
    const all = await store.hgetall(k.answers(pin, game.current));
    distribution = q.choices.map(() => 0);
    for (const raw of Object.values(all)) distribution[(JSON.parse(raw) as AnswerRecord).choice]++;
  }

  return {
    pin: game.pin,
    isHost,
    topicTitle: game.topicTitle,
    lessonTitle: game.lessonTitle,
    modeLabel: DIFFICULTY_INFO[game.mode].label,
    phase,
    serverNow: now,
    index: game.current,
    total: game.questions.length,
    playerCount,
    answeredCount: inQuestion ? answered : 0,
    question: inQuestion
      ? {
          difficulty: q.difficulty,
          newRound: game.mode === "full" && (!prev || prev.difficulty !== q.difficulty),
          text: q.question,
          choices: q.choices,
          timeLimit: q.timeLimit,
          startsAt: game.startsAt,
          endsAt: deadline(game),
          answer: phase === "reveal" ? q.answer : null,
          explanation: phase === "reveal" ? q.explanation : null,
          distribution,
        }
      : null,
    // Lobby: everyone sees who joined. Reveal: top 5. Finished: everyone.
    // Player ids are secrets (they authorize answers), so never send them out.
    leaderboard: (phase === "lobby" || phase === "finished" ? board : phase === "reveal" || isHost ? board.slice(0, 5) : []).map(
      (r) => ({ name: r.name, score: phase === "lobby" ? 0 : r.score, correct: r.correct, rank: r.rank, isMe: r.id === opts.playerId }),
    ),
    me,
  };
}

export type GameState = Awaited<ReturnType<typeof getState>>;
