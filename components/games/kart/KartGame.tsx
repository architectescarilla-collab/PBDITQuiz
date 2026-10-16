"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAST } from "./characters.ts";
import {
  aiInput,
  createRace,
  LAPS,
  standings,
  STATS,
  STEP,
  stepRace,
  type CharId,
  type Input,
  type ItemKind,
  type Race,
  type Racer,
} from "./engine.ts";
import { KartSfx } from "./sfx.ts";
import { TRACK } from "./track.ts";

export const ITEMS: Record<ItemKind, { icon: string; name: string; desc: string }> = {
  boost: { icon: "⚡", name: "Turbo Boost", desc: "A burst of top speed." },
  freeze: { icon: "❄️", name: "Freeze", desc: "Freezes the racer nearest to you for 0.5 s." },
  shield: { icon: "🛡️", name: "Firewall", desc: "Blocks the next Freeze or Swap used on you." },
  swap: { icon: "🔀", name: "Swap", desc: "Trade places with the racer just ahead of you." },
};

const ORDER: CharId[] = ["python", "html", "csharp", "java"];
const MUTE_KEY = "pbdit-kart:muted";
const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;

/* ------------------------------------------------------------------ */
/* Top-level: select → race → results                                  */
/* ------------------------------------------------------------------ */

export function KartGame() {
  const [screen, setScreen] = useState<"select" | "race" | "results">("select");
  const [char, setChar] = useState<CharId>("python");
  const [count, setCount] = useState(4);
  const [runId, setRunId] = useState(0);
  const [results, setResults] = useState<Racer[]>([]);
  const [sfx] = useState(() => new KartSfx());
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MUTE_KEY) === "1";
      sfx.muted = m;
      setMuted(m);
    } catch {}
    return () => sfx.dispose();
  }, [sfx]);

  const toggleMute = useCallback(() => {
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
    try {
      localStorage.setItem(MUTE_KEY, sfx.muted ? "1" : "0");
    } catch {}
  }, [sfx]);

  const start = () => {
    sfx.unlock();
    setRunId((n) => n + 1);
    setScreen("race");
    window.scrollTo({ top: 0 });
  };

  if (screen === "race") {
    return (
      <RaceScreen
        key={runId}
        char={char}
        count={count}
        sfx={sfx}
        muted={muted}
        onToggleMute={toggleMute}
        onFinish={(r) => {
          setResults(r);
          setScreen("results");
        }}
        onRestart={start}
        onQuit={() => setScreen("select")}
      />
    );
  }
  if (screen === "results") return <Results results={results} onAgain={start} onChange={() => setScreen("select")} />;
  return <Select char={char} setChar={setChar} count={count} setCount={setCount} onStart={start} />;
}

/* ------------------------------------------------------------------ */
/* Character select                                                    */
/* ------------------------------------------------------------------ */

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(35 + ((value - 0.88) / (1.17 - 0.88)) * 65);
  return (
    <div className="flex items-center gap-2 text-xs font-bold">
      <span className="w-16 text-ink/60">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand/60">
        <div className="h-full rounded-full bg-clay" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Select(props: {
  char: CharId;
  setChar: (c: CharId) => void;
  count: number;
  setCount: (n: number) => void;
  onStart: () => void;
}) {
  const { char, setChar, count, setCount, onStart } = props;
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 sm:px-6">
      <div>
        <Link href="/games" className="text-sm font-bold text-cream/70 underline">
          ← All games
        </Link>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          PBDIT <span className="text-accent">Kart</span>
        </h1>
        <p className="mt-1 text-cream/75">
          Race the IT crew around a daytime cyber circuit. 3 laps, power-ups, no mercy.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">1. Pick your racer</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((id) => {
            const c = CAST[id];
            const s = STATS[id];
            const on = char === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setChar(id)}
                aria-pressed={on}
                className={`rounded-2xl border-4 bg-paper p-4 text-left text-ink transition ${on ? "border-accent shadow-xl" : "border-transparent opacity-85 hover:opacity-100"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                    style={{ background: c.color }}
                  >
                    {c.emoji}
                  </span>
                  <div>
                    <div className="text-xl font-black">{c.name}</div>
                    <div className="text-sm font-bold text-ink/60">{c.creature}</div>
                  </div>
                </div>
                <p className="mt-2 min-h-10 text-sm text-ink/75">{c.blurb}</p>
                <div className="mt-3 space-y-1.5">
                  <Bar label="Speed" value={s.top} />
                  <Bar label="Accel" value={s.accel} />
                  <Bar label="Handling" value={s.handling} />
                  <Bar label="Weight" value={s.weight} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">2. How many racers?</h2>
        <div className="flex gap-3">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={`min-w-16 rounded-xl border-2 px-5 py-3 text-lg font-extrabold transition ${
                count === n ? "border-accent bg-cream/20" : "border-cream/20 bg-cream/10 hover:border-cream/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-sm text-cream/60">
          You plus {count - 1} computer racer{count > 2 ? "s" : ""}.
        </p>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-xl bg-accent px-8 py-4 text-2xl font-black text-ink shadow-[0_5px_0_#8c5a3c] transition hover:brightness-105 active:translate-y-1 active:shadow-none sm:w-auto"
      >
        🏁 Start race
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-cream/5 p-5">
          <h2 className="mb-3 text-lg font-extrabold">Power-ups (drive through ? boxes)</h2>
          <ul className="space-y-2">
            {(Object.keys(ITEMS) as ItemKind[]).map((k) => (
              <li key={k} className="flex gap-3">
                <span className="text-2xl">{ITEMS[k].icon}</span>
                <span>
                  <b>{ITEMS[k].name}</b> <span className="text-cream/70">— {ITEMS[k].desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-cream/5 p-5 text-sm">
          <h2 className="mb-3 text-lg font-extrabold">Controls</h2>
          <p>
            <b>Keyboard:</b> ↑/W drive · ↓/S brake · ←→/AD steer · <b>Space</b> drift (hold while turning, release for a
            mini-turbo) · <b>E</b> or <b>Enter</b> use item · <b>Esc</b> pause · <b>M</b> mute
          </p>
          <p className="mt-2">
            <b>Phone/tablet:</b> the kart accelerates by itself. Use ◀ ▶ to steer, plus the Item, Drift and Brake
            buttons.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Race                                                                */
/* ------------------------------------------------------------------ */

interface Hud {
  place: number;
  total: number;
  lap: number;
  time: number;
  item: ItemKind | null;
  rolling: boolean;
  countdown: number | null;
  shield: boolean;
}

function RaceScreen(props: {
  char: CharId;
  count: number;
  sfx: KartSfx;
  muted: boolean;
  onToggleMute: () => void;
  onFinish: (r: Racer[]) => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  const { char, count, sfx, muted, onToggleMute, onFinish, onRestart, onQuit } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const raceRef = useRef<Race | null>(null);
  const keys = useRef({ up: false, down: false, left: false, right: false, drift: false, item: false });
  const touch = useRef({ left: false, right: false, drift: false, brake: false });
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [hud, setHud] = useState<Hud>({
    place: count,
    total: count,
    lap: 1,
    time: 0,
    item: null,
    rolling: false,
    countdown: 3,
    shield: false,
  });
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const msgId = useRef(0);
  const finishCb = useRef(onFinish);
  useEffect(() => {
    finishCb.current = onFinish;
  }, [onFinish]);

  const flash = useCallback((text: string) => {
    msgId.current += 1;
    setMsg({ text, id: msgId.current });
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg((m) => (m?.id === msg.id ? null : m)), 1600);
    return () => clearTimeout(t);
  }, [msg]);

  const setPause = useCallback(
    (p: boolean) => {
      pausedRef.current = p;
      setPaused(p);
      if (p) sfx.stop();
    },
    [sfx],
  );

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
  }, []);

  // keyboard
  useEffect(() => {
    const map: Record<string, keyof typeof keys.current> = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      Space: "drift",
      ShiftLeft: "drift",
      ShiftRight: "drift",
    };
    const down = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyP") return setPause(!pausedRef.current);
      if (e.code === "KeyM") return onToggleMute();
      if (e.code === "KeyE" || e.code === "Enter" || e.code === "KeyX") {
        if (!e.repeat) keys.current.item = true;
        e.preventDefault();
        return;
      }
      const k = map[e.code];
      if (k) {
        keys.current[k] = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.code];
      if (k) keys.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onToggleMute, setPause]);

  // game loop
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const race = createRace(char, count);
    raceRef.current = race;
    // Dev only: lets automated tests read the race and borrow the AI's steering. Never in production builds.
    if (process.env.NODE_ENV !== "production") (window as unknown as { __kart?: unknown }).__kart = { race, aiInput };

    let view: import("./scene.ts").KartView | null = null;
    let raf = 0;
    let disposed = false;
    let lastWall = 0;
    let finishedAt = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

    const input = (): Input => {
      const k = keys.current;
      const t = touch.current;
      const left = k.left || t.left;
      const right = k.right || t.right;
      const brake = k.down || t.brake;
      const throttle = brake ? -1 : k.up || coarse ? 1 : 0;
      const useItem = k.item;
      k.item = false;
      return { throttle, steer: (right ? 1 : 0) - (left ? 1 : 0), drift: k.drift || t.drift, useItem };
    };

    const me = race.racers.find((r) => r.isPlayer)!;
    const name = (id: number) => race.racers[id].name;

    const handle = () => {
      for (const e of race.events) {
        const mine = "racer" in e && e.racer === me.id;
        const onMe = "target" in e && e.target === me.id;
        switch (e.type) {
          case "countdown":
            sfx.countdown(e.n);
            break;
          case "go":
            sfx.countdown(0);
            flash("GO!");
            break;
          case "pickup":
            sfx.pickup();
            break;
          case "boost":
            if (mine) sfx.boost();
            break;
          case "shield":
            if (mine) {
              sfx.shield();
              flash("🛡️ Firewall up!");
            }
            break;
          case "freeze":
            if (mine || onMe) sfx.freeze();
            if (mine) flash(`❄️ Froze ${name(e.target)}!`);
            if (onMe) flash(`❄️ Frozen by ${name(e.racer)}!`);
            break;
          case "blocked":
            if (mine || onMe) sfx.blocked();
            if (onMe) flash(`🛡️ Firewall blocked ${name(e.racer)}'s ${ITEMS[e.item].name}!`);
            if (mine) flash(`🛡️ ${name(e.target)}'s firewall blocked you!`);
            break;
          case "swap":
            if (mine || onMe) sfx.swap();
            if (mine) flash(`🔀 Swapped places with ${name(e.target)}!`);
            if (onMe) flash(`🔀 ${name(e.racer)} swapped places with you!`);
            break;
          case "fizzle":
            if (mine) {
              sfx.fizzle();
              flash(e.reason);
            }
            break;
          case "wall":
            if (mine && race.time - lastWall > 0.35) {
              sfx.wall();
              lastWall = race.time;
            }
            break;
          case "lap":
            if (mine) {
              sfx.lap();
              flash(e.lap === LAPS ? "🔔 Final lap!" : `Lap ${e.lap}/${LAPS}`);
            }
            break;
          case "finish":
            if (mine) {
              sfx.finish(e.place === 1);
              flash(`🏁 Finished ${ordinal(e.place)}!`);
            }
            break;
        }
      }
      view?.handleEvents(race, race.events);
      race.events.length = 0;
    };

    const xs = TRACK.map((p) => p.x);
    const zs = TRACK.map((p) => p.z);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const drawMap = () => {
      const c = mapRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const s = c.width;
      const sc = (s - 16) / Math.max(x1 - x0, z1 - z0);
      const ox = (s - (x1 - x0) * sc) / 2;
      const oz = (s - (z1 - z0) * sc) / 2;
      const P = (x: number, z: number) => [ox + (x - x0) * sc, oz + (z - z0) * sc] as const;
      ctx.clearRect(0, 0, s, s);
      ctx.lineCap = ctx.lineJoin = "round";
      for (const [w, col] of [
        [9, "rgba(31,27,22,0.55)"],
        [5, "#e6f4ff"],
      ] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        TRACK.forEach((p, i) => (i ? ctx.lineTo(...P(p.x, p.z)) : ctx.moveTo(...P(p.x, p.z))));
        ctx.closePath();
        ctx.stroke();
      }
      for (const r of [...race.racers].sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer))) {
        const [x, y] = P(r.x, r.z);
        ctx.fillStyle = CAST[r.char].color;
        ctx.strokeStyle = r.isPlayer ? "#ffd43b" : "#ffffff";
        ctx.lineWidth = r.isPlayer ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y, r.isPlayer ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    };

    let last = performance.now();
    let acc = 0;
    let hudT = 0;
    const frame = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!pausedRef.current) {
        acc += dt;
        while (acc >= STEP) {
          stepRace(race, input());
          acc -= STEP;
        }
        handle();
        sfx.setEngine(me.speed, true);
        view?.update(race, dt);
        drawMap();
        hudT += dt;
        if (hudT > 0.08) {
          hudT = 0;
          setHud({
            place: me.place,
            total: race.racers.length,
            lap: Math.min(me.lap, LAPS),
            time: Math.max(0, race.time),
            item: me.item,
            rolling: me.roulette > 0,
            countdown: race.state === "countdown" ? Math.ceil(-race.time) : null,
            shield: me.shieldT > 0,
          });
        }
        if (race.state === "finished") {
          finishedAt ||= now;
          if (now - finishedAt > 2200) {
            sfx.stop();
            finishCb.current(standings(race));
            return;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // load the 3D scene lazily so the select screen stays light
    import("./scene.ts")
      .then(({ KartView }) => {
        if (disposed) return;
        try {
          view = new KartView(wrap, race);
          if (process.env.NODE_ENV !== "production") (window as unknown as { __kartView?: unknown }).__kartView = view;
        } catch (err) {
          console.error(err);
          setFailed(true);
          return;
        }
        raf = requestAnimationFrame(frame);
      })
      .catch(() => setFailed(true));

    const onResize = () => view?.resize();
    window.addEventListener("resize", onResize);
    const onHide = () => document.hidden && setPause(true);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      sfx.stop();
      view?.dispose();
    };
  }, [char, count, sfx, flash, setPause]);

  const hold = (key: keyof typeof touch.current) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      touch.current[key] = true;
      sfx.unlock();
    },
    onPointerUp: () => (touch.current[key] = false),
    onPointerCancel: () => (touch.current[key] = false),
    onPointerLeave: () => (touch.current[key] = false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const itemInfo = hud.item ? ITEMS[hud.item] : null;
  const rollIcons = Object.values(ITEMS).map((i) => i.icon);

  return (
    <div className="relative h-[calc(100dvh-45px)] w-full touch-none overflow-hidden select-none">
      <div ref={wrapRef} className="absolute inset-0" />

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-page p-6 text-center">
          <p className="text-xl font-bold">Your browser couldn&apos;t start 3D graphics (WebGL).</p>
          <button type="button" onClick={onQuit} className="rounded-lg bg-accent px-5 py-3 font-extrabold text-ink">
            Back
          </button>
        </div>
      )}

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="rounded-2xl bg-umber-dark/70 px-4 py-2 text-cream shadow-lg backdrop-blur-sm">
          <div className="text-4xl leading-none font-black sm:text-5xl">
            {ordinal(hud.place)}
            <span className="text-lg text-cream/60">/{hud.total}</span>
          </div>
          <div className="mt-1 text-sm font-extrabold">
            Lap {hud.lap}/{LAPS} · <span className="tabular-nums">{fmtTime(hud.time)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div
            className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-4 bg-paper/90 shadow-lg ${
              hud.item ? "border-accent" : "border-cream/40"
            }`}
            title={itemInfo ? `${itemInfo.name}: ${itemInfo.desc}` : "Drive through a ? box"}
          >
            <span className="text-4xl leading-none">
              {hud.rolling ? rollIcons[Math.floor(Date.now() / 90) % 4] : (itemInfo?.icon ?? "")}
            </span>
            {itemInfo && !hud.rolling && (
              <span className="mt-1 text-[10px] font-extrabold text-ink uppercase">{itemInfo.name}</span>
            )}
          </div>
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPause(true)}
              aria-label="Pause"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-umber-dark/70 text-lg text-cream"
            >
              ⏸
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? "Turn sound on" : "Mute"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-umber-dark/70 text-lg"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      </div>

      {/* minimap */}
      <canvas
        ref={mapRef}
        width={150}
        height={150}
        className={`pointer-events-none absolute left-3 rounded-2xl bg-umber-dark/30 ${isTouch ? "top-28 h-24 w-24" : "bottom-3 h-36 w-36"}`}
      />

      {hud.shield && (
        <div className="pointer-events-none absolute top-24 right-3 rounded-full bg-[#3fd6f5]/85 px-3 py-1 text-xs font-extrabold text-ink">
          🛡️ Firewall on
        </div>
      )}

      {/* countdown + announcements */}
      {hud.countdown !== null && hud.countdown > 0 && (
        <div
          key={hud.countdown}
          className="animate-pop pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="text-[9rem] leading-none font-black text-cream drop-shadow-[0_6px_0_rgba(31,27,22,0.6)]">
            {hud.countdown}
          </span>
        </div>
      )}
      {msg && (
        <div
          key={msg.id}
          className="animate-pop pointer-events-none absolute inset-x-0 top-[28%] flex justify-center px-4"
        >
          <span className="rounded-2xl bg-umber-dark/75 px-5 py-3 text-center text-2xl font-black text-cream shadow-xl sm:text-3xl">
            {msg.text}
          </span>
        </div>
      )}

      {/* touch controls */}
      {isTouch && !paused && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Steer left"
              className="h-20 w-20 rounded-full bg-paper/80 text-3xl font-black text-ink shadow-lg active:bg-accent"
              {...hold("left")}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Steer right"
              className="h-20 w-20 rounded-full bg-paper/80 text-3xl font-black text-ink shadow-lg active:bg-accent"
              {...hold("right")}
            >
              ▶
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="h-14 w-14 rounded-full bg-paper/70 text-xs font-extrabold text-ink shadow active:bg-accent"
                {...hold("brake")}
              >
                Brake
              </button>
              <button
                type="button"
                className="h-14 w-14 rounded-full bg-paper/70 text-xs font-extrabold text-ink shadow active:bg-accent"
                {...hold("drift")}
              >
                Drift
              </button>
            </div>
            <button
              type="button"
              aria-label="Use item"
              className="h-24 w-24 rounded-full bg-accent text-4xl font-black text-ink shadow-xl active:scale-95"
              onPointerDown={(e) => {
                e.preventDefault();
                sfx.unlock();
                keys.current.item = true;
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {itemInfo && !hud.rolling ? itemInfo.icon : <span className="text-lg">ITEM</span>}
            </button>
          </div>
        </div>
      )}

      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-umber-dark/60 p-6">
          <div className="animate-pop w-full max-w-xs space-y-3 rounded-2xl bg-paper p-6 text-center text-ink shadow-2xl">
            <p className="text-2xl font-black">Paused</p>
            <button
              type="button"
              onClick={() => setPause(false)}
              className="w-full rounded-lg bg-accent py-3 text-lg font-extrabold"
            >
              Resume
            </button>
            <button type="button" onClick={onRestart} className="w-full rounded-lg bg-sand py-3 font-extrabold">
              Restart race
            </button>
            <button type="button" onClick={onQuit} className="w-full rounded-lg bg-sand/50 py-3 font-extrabold">
              Change racer
            </button>
            <Link href="/games" className="block pt-1 text-sm font-bold underline">
              Back to all games
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function Results({ results, onAgain, onChange }: { results: Racer[]; onAgain: () => void; onChange: () => void }) {
  const me = results.find((r) => r.isPlayer);
  const winner = results[0];
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-16 text-center sm:px-6">
      <div className="pt-4">
        <p className="text-6xl">{me?.place === 1 ? "🏆" : me && me.place <= 3 ? "🏁" : "💪"}</p>
        <h1 className="mt-2 text-4xl font-black">
          {me?.place === 1 ? "You win!" : `You finished ${ordinal(me?.place ?? 0)}`}
        </h1>
        {me?.place !== 1 && (
          <p className="mt-1 text-cream/75">
            {CAST[winner.char].emoji} {winner.name} took the win.
          </p>
        )}
      </div>
      <ol className="space-y-2 text-left">
        {results.map((r) => (
          <li
            key={r.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold ${r.isPlayer ? "bg-accent text-ink" : "bg-paper text-ink"}`}
          >
            <span className="w-10 text-xl font-black">{ordinal(r.place)}</span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl"
              style={{ background: CAST[r.char].color }}
            >
              {CAST[r.char].emoji}
            </span>
            <span className="flex-1">
              {r.name} {r.isPlayer && <span className="text-sm">(you)</span>}
            </span>
            <span className="tabular-nums">{r.finishTime !== null ? fmtTime(r.finishTime) : "—"}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-xl bg-accent px-6 py-3 text-lg font-black text-ink shadow-[0_4px_0_#8c5a3c]"
        >
          Race again
        </button>
        <button type="button" onClick={onChange} className="rounded-xl bg-cream/15 px-6 py-3 text-lg font-extrabold">
          Change racer
        </button>
      </div>
    </div>
  );
}
