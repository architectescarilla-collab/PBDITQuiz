"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sfx } from "./sfx";

/* ------------------------------------------------------------------ */
/* Tuning — all in logical pixels / seconds on a 400×640 playfield     */
/* ------------------------------------------------------------------ */
const W = 400;
const H = 640;
const GROUND = 70; // street height
const GRAVITY = 1650;
const FLAP = -470;
const MAX_FALL = 720;
const STEP = 1 / 120; // fixed physics step
const PLAYER_X = 110;
const SPRITE_H = 86;
const SPRITE_W = (SPRITE_H * 162) / 320; // keeps the image's aspect ratio
const TOWER_W = 76;
const TOWER_SPACING = 235;
// Storage keys keep the original "flappy-bj" name so saved best scores survive the rename.
const BEST_KEY = "flappy-bj:best";
const MUTE_KEY = "flappy-bj:muted";

const TOWER_COLORS = ["#a85d45", "#4f6b78", "#5e6b45", "#8c5a3c", "#7b5e72"];

export const MEDALS = [
  { min: 40, name: "Platinum", emoji: "💎" },
  { min: 30, name: "Gold", emoji: "🥇" },
  { min: 20, name: "Silver", emoji: "🥈" },
  { min: 10, name: "Bronze", emoji: "🥉" },
];

type Phase = "ready" | "playing" | "dying" | "over";

interface Tower {
  x: number;
  gapY: number; // centre of the gap
  gap: number;
  color: string;
  windows: number; // seed for the window pattern
  scored: boolean;
}

interface World {
  phase: Phase;
  y: number;
  vy: number;
  angle: number;
  towers: Tower[];
  score: number;
  t: number; // seconds since start (for bobbing / scrolling)
  scroll: number; // total distance scrolled
  flash: number; // white flash after a crash
}

/** Difficulty ramps gently with score. */
const speedFor = (score: number) => Math.min(150 + score * 2.2, 215);
const gapFor = (score: number) => Math.max(180 - score * 1.1, 142);

function newWorld(): World {
  return { phase: "ready", y: H * 0.42, vy: 0, angle: 0, towers: [], score: 0, t: 0, scroll: 0, flash: 0 };
}

function spawnTower(x: number, score: number): Tower {
  const gap = gapFor(score);
  const margin = 70;
  const min = margin + gap / 2;
  const max = H - GROUND - margin - gap / 2;
  return {
    x,
    gap,
    gapY: min + Math.random() * (max - min),
    color: TOWER_COLORS[Math.floor(Math.random() * TOWER_COLORS.length)],
    windows: Math.floor(Math.random() * 1e6),
    scored: false,
  };
}

/** Hit circles in world space: one for the (big) head, one for the body. */
function hitCircles(w: World) {
  const top = w.y - SPRITE_H / 2;
  return [
    { x: PLAYER_X, y: top + SPRITE_H * 0.32, r: SPRITE_W * 0.42 },
    { x: PLAYER_X + 2, y: top + SPRITE_H * 0.78, r: SPRITE_W * 0.2 },
  ];
}

function circleHitsRect(c: { x: number; y: number; r: number }, rx: number, ry: number, rw: number, rh: number) {
  const nx = Math.max(rx, Math.min(c.x, rx + rw));
  const ny = Math.max(ry, Math.min(c.y, ry + rh));
  return (c.x - nx) ** 2 + (c.y - ny) ** 2 < c.r * c.r;
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

// Deterministic pseudo-random for skyline + windows (no flicker between frames).
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function drawSkyline(ctx: CanvasRenderingContext2D, scroll: number, speed: number, base: number, color: string, seed: number, maxH: number) {
  ctx.fillStyle = color;
  const unit = 38;
  const offset = (scroll * speed) % unit;
  const first = Math.floor((scroll * speed) / unit);
  for (let i = -1; i < W / unit + 2; i++) {
    const n = first + i;
    const h = 40 + rand(n + seed) * maxH;
    const w = unit - 4 - rand(n * 3 + seed) * 10;
    ctx.fillRect(i * unit - offset, base - h, w, h);
  }
}

function drawTower(ctx: CanvasRenderingContext2D, t: Tower) {
  const groundY = H - GROUND;
  const topEnd = t.gapY - t.gap / 2; // bottom edge of the hanging tower
  const botStart = t.gapY + t.gap / 2; // roof of the standing tower

  const body = (x: number, y: number, w: number, h: number, flip: boolean) => {
    ctx.fillStyle = t.color;
    ctx.fillRect(x, y, w, h);
    // shading strip
    ctx.fillStyle = "rgba(31,27,22,0.22)";
    ctx.fillRect(x + w - 14, y, 14, h);
    // windows
    const cols = 3;
    const ww = 12;
    const wh = 14;
    const gx = (w - 14 - cols * ww) / (cols + 1);
    for (let row = 0; ; row++) {
      const wy = flip ? y + h - 22 - row * 26 - wh : y + 22 + row * 26;
      if (flip ? wy < y + 6 : wy + wh > y + h - 6) break;
      for (let c = 0; c < cols; c++) {
        const lit = rand(t.windows + row * 7 + c) > 0.62;
        ctx.fillStyle = lit ? "rgba(239,201,120,0.9)" : "rgba(239,230,212,0.28)";
        ctx.fillRect(x + gx + c * (ww + gx), wy, ww, wh);
      }
    }
  };

  // hanging tower (from the top) with a ledge at its lower edge
  body(t.x, 0, TOWER_W, topEnd, true);
  ctx.fillStyle = "#3b3229";
  ctx.fillRect(t.x - 5, topEnd - 12, TOWER_W + 10, 12);

  // standing tower with parapet and antenna
  body(t.x, botStart, TOWER_W, groundY - botStart, false);
  ctx.fillStyle = "#3b3229";
  ctx.fillRect(t.x - 5, botStart, TOWER_W + 10, 12);
  ctx.fillRect(t.x + TOWER_W / 2 - 2, botStart - 22, 4, 22);
  ctx.fillStyle = "#e2a48f";
  ctx.beginPath();
  ctx.arc(t.x + TOWER_W / 2, botStart - 24, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, w: World, img: HTMLImageElement | null) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#d9c6a5");
  sky.addColorStop(0.55, "#e8dcc6");
  sky.addColorStop(1, "#cdb894");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // sun
  ctx.fillStyle = "rgba(210,168,97,0.55)";
  ctx.beginPath();
  ctx.arc(300, 150, 46, 0, Math.PI * 2);
  ctx.fill();

  // parallax skylines
  drawSkyline(ctx, w.scroll, 0.15, H - GROUND, "rgba(140,118,92,0.35)", 11, 200);
  drawSkyline(ctx, w.scroll, 0.35, H - GROUND, "rgba(110,92,72,0.45)", 37, 130);

  // towers
  for (const t of w.towers) drawTower(ctx, t);

  // street
  const gy = H - GROUND;
  ctx.fillStyle = "#3b3229";
  ctx.fillRect(0, gy, W, GROUND);
  ctx.fillStyle = "#8c7a62";
  ctx.fillRect(0, gy, W, 10);
  ctx.fillStyle = "rgba(239,230,212,0.7)";
  const dash = 40;
  const off = w.scroll % (dash * 2);
  for (let x = -off; x < W; x += dash * 2) ctx.fillRect(x, gy + 38, dash, 5);

  // player
  const cx = PLAYER_X;
  const cy = w.y;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(w.angle);
  if (img) {
    ctx.shadowColor = "rgba(31,27,22,0.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(img, -SPRITE_W / 2, -SPRITE_H / 2, SPRITE_W, SPRITE_H);
  } else {
    ctx.fillStyle = "#d2a861";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // score
  if (w.phase !== "ready") {
    ctx.font = "900 52px Montserrat, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#2b251f";
    ctx.strokeText(String(w.score), W / 2, 84);
    ctx.fillStyle = "#f4eee2";
    ctx.fillText(String(w.score), W / 2, 84);
  }

  // crash flash
  if (w.flash > 0) {
    ctx.fillStyle = `rgba(244,238,226,${w.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function FlappyBoji() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(newWorld());
  const imgRef = useRef<HTMLImageElement | null>(null);
  const overAt = useRef(0);
  const bestRef = useRef(0);
  const [sfx] = useState(() => new Sfx());
  const [muted, setMuted] = useState(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [size, setSize] = useState({ w: W, h: H });

  useEffect(() => {
    try {
      bestRef.current = Number(localStorage.getItem(BEST_KEY)) || 0;
      setBest(bestRef.current);
      const m = localStorage.getItem(MUTE_KEY) === "1";
      sfx.muted = m;
      setMuted(m);
    } catch {}
    const img = new Image();
    img.src = "/games/bj-caricature.png";
    img.onload = () => (imgRef.current = img);
  }, []);

  // Fit the 400×640 playfield into the available space.
  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const maxW = Math.min(el.clientWidth, 480);
      const maxH = window.innerHeight - el.getBoundingClientRect().top - 16;
      const scale = Math.max(0.5, Math.min(maxW / W, maxH / H));
      setSize({ w: Math.round(W * scale), h: Math.round(H * scale) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const finish = useCallback(() => {
    const w = world.current;
    w.phase = "over";
    overAt.current = performance.now();
    setPhase("over");
    const isBest = w.score > bestRef.current;
    setNewBest(isBest);
    if (isBest) {
      bestRef.current = w.score;
      setBest(w.score);
      try {
        localStorage.setItem(BEST_KEY, String(w.score));
      } catch {}
    }
  }, []);

  const toggleMute = useCallback(() => {
    const m = !sfx.muted;
    sfx.muted = m;
    setMuted(m);
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {}
  }, [sfx]);

  const flap = useCallback(() => {
    sfx.unlock(); // audio may only start after a user gesture
    const w = world.current;
    if (w.phase === "over") {
      if (performance.now() - overAt.current < 450) return; // avoid instant accidental restarts
      world.current = newWorld();
      setScore(0);
      setNewBest(false);
      setPhase("ready");
      return;
    }
    if (w.phase === "dying") return;
    if (w.phase === "ready") {
      w.phase = "playing";
      setPhase("playing");
      w.towers = [spawnTower(W + 60, 0)];
    }
    w.vy = FLAP;
    sfx.flap();
  }, [sfx]);

  // Dev only: lets automated tests read the game state. Never shipped in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __flappy?: unknown }).__flappy = world;
  }, []);

  // Keyboard: Space / ↑ / W
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (!e.repeat) flap();
      } else if (e.code === "KeyM" && !e.repeat) {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap, toggleMute]);

  // Game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const update = (dt: number) => {
      const w = world.current;
      w.t += dt;
      if (w.flash > 0) w.flash = Math.max(0, w.flash - dt * 2.5);

      if (w.phase === "ready") {
        w.y = H * 0.42 + Math.sin(w.t * 3) * 8; // idle bob
        w.angle = Math.sin(w.t * 3) * 0.05;
        w.scroll += 90 * dt;
        return;
      }
      if (w.phase === "over") return;

      // physics (also while dying, so the player falls to the street)
      w.vy = Math.min(w.vy + GRAVITY * dt, MAX_FALL);
      w.y += w.vy * dt;
      const target = Math.max(-0.45, Math.min(w.vy / 650, 1.25));
      w.angle += (target - w.angle) * Math.min(1, dt * 10);

      const floor = H - GROUND - SPRITE_H * 0.42;
      if (w.y >= floor) {
        w.y = floor;
        if (w.phase === "playing") {
          w.flash = 0.8;
          sfx.crash();
        } else {
          sfx.land(); // falling after a tower crash
        }
        finish();
        return;
      }
      if (w.y < -SPRITE_H) w.y = -SPRITE_H; // can't fly off the top forever

      if (w.phase !== "playing") return;

      const speed = speedFor(w.score);
      w.scroll += speed * dt;
      for (const t of w.towers) t.x -= speed * dt;
      if (w.towers.length && w.towers[0].x < -TOWER_W - 10) w.towers.shift();
      const lastT = w.towers[w.towers.length - 1];
      if (!lastT || lastT.x < W - TOWER_SPACING) w.towers.push(spawnTower((lastT?.x ?? W) + TOWER_SPACING, w.score));

      for (const t of w.towers) {
        if (!t.scored && t.x + TOWER_W < PLAYER_X) {
          t.scored = true;
          w.score += 1;
          setScore(w.score);
        }
        const topH = t.gapY - t.gap / 2;
        const botY = t.gapY + t.gap / 2;
        for (const c of hitCircles(w)) {
          // ledges stick out 5px on each side
          if (
            circleHitsRect(c, t.x - 5, -200, TOWER_W + 10, topH + 200) ||
            circleHitsRect(c, t.x - 5, botY, TOWER_W + 10, H - botY)
          ) {
            w.phase = "dying";
            w.flash = 0.8;
            sfx.crash();
            w.vy = Math.max(w.vy, 120);
            setPhase("dying");
            return;
          }
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab switches
      last = now;
      acc += dt;
      while (acc >= STEP) {
        update(STEP);
        acc -= STEP;
      }
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const dpr = window.devicePixelRatio || 1;
        const pw = Math.round(canvas.clientWidth * dpr);
        const ph = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
        }
        ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
        draw(ctx, world.current, imgRef.current);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [finish, sfx]);

  const medal = MEDALS.find((m) => score >= m.min);

  return (
    <div ref={wrapRef} className="flex w-full justify-center">
      <div
        className="relative touch-none overflow-hidden rounded-2xl shadow-2xl select-none"
        style={{ width: size.w, height: size.h }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          flap();
        }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-label="Flappy Boji game" role="img" />

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Turn sound on (M)" : "Mute sound (M)"}
          title={muted ? "Sound off — press M" : "Sound on — press M"}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-umber/80 text-lg text-cream shadow transition hover:bg-umber"
        >
          {muted ? "🔇" : "🔊"}
        </button>

        {phase === "ready" && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-[11%] text-center text-ink">
              <p className="text-4xl font-black tracking-tight drop-shadow-sm">
                Flappy <span className="text-clay">Boji</span>
              </p>
              <p className="mt-1 text-sm font-bold text-ink/70">Fly between the skyscrapers</p>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-[17%] flex justify-center">
              <p className="animate-pulse rounded-full bg-umber/85 px-4 py-2 text-sm font-extrabold text-cream">
                Tap, click or press Space to fly
              </p>
            </div>
          </>
        )}

        {phase === "over" && (
          <div className="absolute inset-0 flex items-center justify-center bg-umber-dark/35 p-6">
            <div className="animate-pop w-full max-w-xs rounded-2xl bg-paper p-6 text-center text-ink shadow-2xl">
              <p className="text-2xl font-black">Game over</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-sand/40 p-3">
                  <div className="text-xs font-extrabold tracking-wider text-ink/60 uppercase">Score</div>
                  <div className="text-3xl font-black">{score}</div>
                </div>
                <div className="rounded-xl bg-sand/40 p-3">
                  <div className="text-xs font-extrabold tracking-wider text-ink/60 uppercase">Best</div>
                  <div className="text-3xl font-black">{best}</div>
                </div>
              </div>
              <p className="mt-3 h-6 text-sm font-bold text-clay">
                {[newBest && "🎉 New best!", medal ? `${medal.emoji} ${medal.name} medal` : !newBest && "Pass 10 towers for a medal"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <button
                type="button"
                onClick={flap}
                className="mt-4 w-full rounded-lg bg-umber px-6 py-3 text-lg font-extrabold text-cream shadow-[0_4px_0_var(--color-umber-dark)] transition hover:bg-umber-dark active:translate-y-0.5 active:shadow-none"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
