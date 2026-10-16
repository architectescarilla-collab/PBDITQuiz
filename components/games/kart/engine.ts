/**
 * PBDIT Kart race engine — pure simulation (no rendering), stepped at a fixed rate.
 * Handles driving physics, walls, laps, standings, item boxes, power-ups and AI drivers.
 */
import { lateralOffset, nearestIndex, pointAt, ROAD_HALF, TRACK_SAMPLES, WALL, wrap, type Track } from "./track.ts";

export type CharId = "python" | "html" | "csharp" | "java";
export type ItemKind = "boost" | "freeze" | "shield" | "swap";

export interface CharStats {
  accel: number;
  top: number;
  handling: number;
  weight: number;
}

export const STATS: Record<CharId, CharStats> = {
  python: { accel: 1.1, top: 0.97, handling: 1.05, weight: 0.95 },
  html: { accel: 1.0, top: 0.98, handling: 1.1, weight: 0.9 },
  csharp: { accel: 0.95, top: 1.03, handling: 0.98, weight: 1.05 },
  java: { accel: 0.92, top: 1.04, handling: 0.95, weight: 1.15 },
};

export const LAPS = 3;
export const STEP = 1 / 60;
const BASE_TOP = 31;
const BOOST_TOP = 46;
const OFFROAD_TOP = 15;
const ACCEL = 19;
const BRAKE = 34;
const TURN = 1.9;
export const FREEZE_TIME = 0.5;
export const BOOST_TIME = 1.6;
export const SHIELD_TIME = 10;
const ROULETTE_TIME = 1.1;
const BOX_RESPAWN = 3;
const KART_RADIUS = 1.6;
const COUNTDOWN = 3;

export interface Input {
  throttle: number; // -1..1
  steer: number; // -1 (turn left) .. 1 (turn right)
  drift: boolean;
  useItem: boolean;
}

export interface Racer {
  id: number;
  char: CharId;
  name: string;
  isPlayer: boolean;
  x: number;
  z: number;
  heading: number; // radians, forward = (cos, sin) in XZ
  speed: number;
  steerVis: number; // smoothed steer for animation
  idx: number;
  progress: number; // continuous distance in track samples (laps * SAMPLES + idx)
  lap: number; // 1-based current lap (for display)
  finishTime: number | null;
  item: ItemKind | null;
  roulette: number; // >0 while the item roulette spins
  boostT: number;
  frozenT: number;
  shieldT: number;
  driftT: number; // how long the current drift has been held
  drifting: boolean;
  offroad: boolean;
  place: number;
  // AI
  aiLane: number;
  aiLaneT: number;
  aiItemT: number;
  aiSkill: number;
}

export interface ItemBox {
  idx: number;
  lateral: number;
  x: number;
  z: number;
  respawn: number; // >0 while hidden
}

export type RaceEvent =
  | { type: "countdown"; n: number }
  | { type: "go" }
  | { type: "pickup"; racer: number }
  | { type: "item"; racer: number; item: ItemKind }
  | { type: "boost"; racer: number }
  | { type: "freeze"; racer: number; target: number }
  | { type: "shield"; racer: number }
  | { type: "blocked"; racer: number; target: number; item: ItemKind }
  | { type: "swap"; racer: number; target: number }
  | { type: "fizzle"; racer: number; item: ItemKind; reason: string }
  | { type: "wall"; racer: number }
  | { type: "lap"; racer: number; lap: number }
  | { type: "finish"; racer: number; place: number };

export interface Race {
  track: Track;
  racers: Racer[];
  boxes: ItemBox[];
  time: number; // seconds since GO (negative during countdown)
  state: "countdown" | "running" | "finished";
  events: RaceEvent[]; // drained by the renderer every frame
  finishedCount: number;
}

const NAMES: Record<CharId, string> = { python: "Python", html: "HTML", csharp: "C#", java: "Java" };

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

export function createRace(track: Track, playerChar: CharId | null, count: number): Race {
  const order: CharId[] = ["python", "html", "csharp", "java"];
  const chars: CharId[] = playerChar ? [playerChar, ...order.filter((c) => c !== playerChar)] : order;
  const n = Math.max(1, Math.min(4, count));
  const racers: Racer[] = chars.slice(0, n).map((char, i) => {
    // grid: two karts per row behind the start line; the player starts at the back like Mario Kart
    const slot = playerChar ? (i === 0 ? n - 1 : i - 1) : i;
    const row = Math.floor(slot / 2);
    const idx = wrap(-8 - row * 9);
    const lateral = slot % 2 === 0 ? 4 : -4;
    const p = pointAt(track, idx, lateral);
    return {
      id: i,
      char,
      name: NAMES[char],
      isPlayer: playerChar !== null && i === 0,
      x: p.x,
      z: p.z,
      heading: p.heading,
      speed: 0,
      steerVis: 0,
      idx,
      progress: idx - TRACK_SAMPLES, // just behind the line
      lap: 1,
      finishTime: null,
      item: null,
      roulette: 0,
      boostT: 0,
      frozenT: 0,
      shieldT: 0,
      driftT: 0,
      drifting: false,
      offroad: false,
      place: slot + 1,
      aiLane: lateral,
      aiLaneT: 0,
      aiItemT: 0,
      aiSkill: 0.94 + Math.random() * 0.05,
    };
  });

  const boxes: ItemBox[] = [];
  for (const f of [0.17, 0.45, 0.73]) {
    for (const lateral of [-7, -2.5, 2.5, 7]) {
      const idx = Math.round(f * TRACK_SAMPLES);
      const p = pointAt(track, idx, lateral);
      boxes.push({ idx, lateral, x: p.x, z: p.z, respawn: 0 });
    }
  }
  return { track, racers, boxes, time: -COUNTDOWN, state: "countdown", events: [], finishedCount: 0 };
}

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

/** Mario Kart-style odds: leaders get defensive items, trailing racers get swaps & freezes. */
function rollItem(place: number, total: number): ItemKind {
  const rel = total <= 1 ? 0 : (place - 1) / (total - 1); // 0 = leader, 1 = last
  const w: Record<ItemKind, number> = {
    boost: 38 - rel * 8,
    shield: 45 - rel * 35,
    freeze: 15 + rel * 10,
    swap: rel * 35,
  };
  let r = Math.random() * (w.boost + w.shield + w.freeze + w.swap);
  for (const k of ["boost", "shield", "freeze", "swap"] as ItemKind[]) {
    r -= w[k];
    if (r <= 0) return k;
  }
  return "boost";
}

function standings(race: Race): Racer[] {
  return [...race.racers].sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime;
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.progress - a.progress;
  });
}

/** Tries to hit `target`; a shield blocks it (and is used up). Returns true if it landed. */
function strike(race: Race, user: Racer, target: Racer, item: ItemKind): boolean {
  if (target.shieldT > 0) {
    target.shieldT = 0;
    race.events.push({ type: "blocked", racer: user.id, target: target.id, item });
    return false;
  }
  return true;
}

export function fireItem(race: Race, r: Racer): boolean {
  if (!r.item || r.roulette > 0 || r.frozenT > 0 || r.finishTime !== null) return false;
  const item = r.item;
  const others = race.racers.filter((o) => o !== r && o.finishTime === null);

  if (item === "boost") {
    r.boostT = BOOST_TIME;
    race.events.push({ type: "boost", racer: r.id });
  } else if (item === "shield") {
    r.shieldT = SHIELD_TIME;
    race.events.push({ type: "shield", racer: r.id });
  } else if (item === "freeze") {
    // the racer physically nearest to you
    const target = others.sort((a, b) => Math.hypot(a.x - r.x, a.z - r.z) - Math.hypot(b.x - r.x, b.z - r.z))[0];
    if (!target) {
      race.events.push({ type: "fizzle", racer: r.id, item, reason: "No racer nearby" });
      return false;
    }
    if (strike(race, r, target, item)) {
      target.frozenT = FREEZE_TIME;
      target.speed = 0;
      target.boostT = 0;
      race.events.push({ type: "freeze", racer: r.id, target: target.id });
    }
  } else if (item === "swap") {
    // the racer directly ahead of you in the standings
    const order = standings(race);
    const target = order[order.indexOf(r) - 1];
    if (!target || target.finishTime !== null) {
      race.events.push({ type: "fizzle", racer: r.id, item, reason: "No one ahead to swap with" });
      return false; // keep the item
    }
    if (strike(race, r, target, item)) {
      for (const k of ["x", "z", "heading", "idx", "progress", "lap"] as const) {
        const tmp = r[k];
        r[k] = target[k];
        target[k] = tmp;
      }
      race.events.push({ type: "swap", racer: r.id, target: target.id });
    }
  }
  r.item = null;
  race.events.push({ type: "item", racer: r.id, item });
  return true;
}

/* ------------------------------------------------------------------ */
/* AI                                                                  */
/* ------------------------------------------------------------------ */

export function aiInput(race: Race, r: Racer, dt: number): Input {
  r.aiLaneT -= dt;
  if (r.aiLaneT <= 0) {
    r.aiLane = (Math.random() * 2 - 1) * 6.5;
    r.aiLaneT = 2 + Math.random() * 3;
  }
  const look = 10 + r.speed * 0.45;
  const target = pointAt(race.track, r.idx + Math.round(look / race.track.spacing), r.aiLane);
  const want = Math.atan2(target.z - r.z, target.x - r.x);
  let diff = want - r.heading;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  // items: use after a short "thinking" delay
  let use = false;
  if (r.item && r.roulette <= 0) {
    r.aiItemT -= dt;
    if (r.aiItemT <= 0) {
      use = true;
      r.aiItemT = 0.6 + Math.random() * 2;
    }
  }
  return { throttle: 1, steer: Math.max(-1, Math.min(1, diff * 2.4)), drift: false, useItem: use };
}

/* ------------------------------------------------------------------ */
/* Step                                                                */
/* ------------------------------------------------------------------ */

function stepRacer(
  race: Race,
  r: Racer,
  input: Input,
  dt: number,
  leaderProgress: number,
  playerProgress: number | null,
) {
  const st = STATS[r.char];
  r.boostT = Math.max(0, r.boostT - dt);
  r.shieldT = Math.max(0, r.shieldT - dt);
  if (r.roulette > 0) {
    r.roulette -= dt;
    if (r.roulette <= 0) {
      r.item = rollItem(r.place, race.racers.length);
      if (r.isPlayer) race.events.push({ type: "pickup", racer: r.id });
    }
  }

  if (r.frozenT > 0) {
    r.frozenT = Math.max(0, r.frozenT - dt);
    r.speed = 0;
    return;
  }
  if (input.useItem) fireItem(race, r);

  const finished = r.finishTime !== null;
  // AI rubber-banding keeps races close
  let top = BASE_TOP * st.top;
  if (!r.isPlayer) {
    top *= r.aiSkill;
    const ref = playerProgress ?? leaderProgress;
    const gap = (ref - r.progress) / TRACK_SAMPLES; // laps behind the player
    if (gap > 0.12) top *= 1.07;
    else if (gap < -0.15) top *= 0.94;
  }
  if (r.boostT > 0) top = BOOST_TOP;
  if (r.offroad && r.boostT <= 0) top = Math.min(top, OFFROAD_TOP);
  if (finished) top *= 0.55; // cruise after the line

  const throttle = finished && !r.isPlayer ? 0.6 : input.throttle;
  if (throttle > 0) {
    if (r.speed < top) r.speed = Math.min(top, r.speed + ACCEL * st.accel * throttle * dt * (r.boostT > 0 ? 2.2 : 1));
    else r.speed = Math.max(top, r.speed - 26 * dt);
  } else if (throttle < 0) {
    r.speed = Math.max(-9, r.speed - BRAKE * dt);
  } else {
    r.speed *= Math.pow(0.55, dt); // coast
    if (Math.abs(r.speed) < 0.3) r.speed = 0;
  }

  // steering (needs some speed, like a real car)
  const grip = Math.min(1, Math.abs(r.speed) / 9) * Math.sign(r.speed || 1);
  const drifting = input.drift && Math.abs(input.steer) > 0.3 && r.speed > 14;
  if (drifting) r.driftT += dt;
  else if (r.drifting) {
    // releasing a long drift gives a mini-turbo (not if the drift ended in a crash)
    if (r.driftT > 0.9 && r.speed > 14) {
      r.boostT = Math.max(r.boostT, r.driftT > 1.8 ? 0.9 : 0.5);
      race.events.push({ type: "boost", racer: r.id });
    }
    r.driftT = 0;
  }
  r.drifting = drifting;
  const turn = TURN * st.handling * (drifting ? 1.35 : 1) * (r.boostT > 0 ? 0.85 : 1);
  r.heading += input.steer * turn * grip * dt;
  r.steerVis += (input.steer - r.steerVis) * Math.min(1, dt * 8);

  r.x += Math.cos(r.heading) * r.speed * dt;
  r.z += Math.sin(r.heading) * r.speed * dt;

  // track position, walls and off-road
  const prev = r.idx;
  r.idx = nearestIndex(race.track, r.x, r.z, r.idx);
  let lat = lateralOffset(race.track, r.x, r.z, r.idx);
  r.offroad = Math.abs(lat) > ROAD_HALF;
  if (Math.abs(lat) > WALL - KART_RADIUS) {
    const p = race.track.points[r.idx];
    const clamp = Math.sign(lat) * (WALL - KART_RADIUS);
    r.x += p.nx * (clamp - lat);
    r.z += p.nz * (clamp - lat);
    lat = clamp;
    if (r.speed > 12) race.events.push({ type: "wall", racer: r.id });
    r.speed *= 0.72;
    // nudge heading back along the track
    const along = Math.atan2(p.tz, p.tx);
    let d = along - r.heading;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    r.heading += d * 0.25;
  }

  // progress & laps
  let delta = r.idx - prev;
  if (delta > TRACK_SAMPLES / 2) delta -= TRACK_SAMPLES;
  if (delta < -TRACK_SAMPLES / 2) delta += TRACK_SAMPLES;
  r.progress += delta;
  const lap = Math.floor(r.progress / TRACK_SAMPLES) + 1;
  if (!finished && lap > r.lap) {
    r.lap = lap;
    if (lap > LAPS) {
      r.finishTime = race.time;
      race.finishedCount++;
      race.events.push({ type: "finish", racer: r.id, place: race.finishedCount });
    } else {
      race.events.push({ type: "lap", racer: r.id, lap });
    }
  }

  // item boxes
  if (!r.item && r.roulette <= 0 && !finished) {
    for (const b of race.boxes) {
      if (b.respawn <= 0 && (b.x - r.x) ** 2 + (b.z - r.z) ** 2 < 2.6 ** 2) {
        b.respawn = BOX_RESPAWN;
        r.roulette = ROULETTE_TIME;
        r.aiItemT = 0.6 + Math.random() * 2;
        break;
      }
    }
  }
}

function collideKarts(race: Race) {
  const rs = race.racers;
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i];
      const b = rs[j];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const d = Math.hypot(dx, dz);
      const min = KART_RADIUS * 2;
      if (d > 0 && d < min) {
        const wa = STATS[b.char].weight / (STATS[a.char].weight + STATS[b.char].weight);
        const push = min - d;
        a.x -= (dx / d) * push * wa;
        a.z -= (dz / d) * push * wa;
        b.x += (dx / d) * push * (1 - wa);
        b.z += (dz / d) * push * (1 - wa);
        a.speed *= 0.96;
        b.speed *= 0.96;
      }
    }
  }
}

/** Advances the race by one fixed step. `playerInput` is ignored for AI racers. */
export function stepRace(race: Race, playerInput: Input | null, dt = STEP) {
  const before = race.time;
  race.time += dt;

  if (race.state === "countdown") {
    if (Math.ceil(-before) !== Math.ceil(-race.time) && race.time < 0)
      race.events.push({ type: "countdown", n: Math.ceil(-race.time) });
    if (race.time >= 0) {
      race.state = "running";
      race.events.push({ type: "go" });
    }
    return;
  }

  for (const b of race.boxes) b.respawn = Math.max(0, b.respawn - dt);

  const leader = Math.max(...race.racers.map((r) => r.progress));
  const player = race.racers.find((r) => r.isPlayer);
  for (const r of race.racers) {
    const input = r.isPlayer && playerInput ? playerInput : aiInput(race, r, dt);
    stepRacer(race, r, input, dt, leader, player ? player.progress : null);
  }
  collideKarts(race);

  standings(race).forEach((r, i) => (r.place = i + 1));

  // the race ends when the player finishes (or everyone does in an all-AI race),
  // with a short grace period so close rivals can cross the line too
  const done = player ? player.finishTime !== null : race.finishedCount === race.racers.length;
  if (done && race.state === "running") {
    const lastFinish = Math.max(...race.racers.map((r) => r.finishTime ?? 0));
    if (race.finishedCount === race.racers.length || race.time - lastFinish > 6) race.state = "finished";
  }
}

export { standings };
