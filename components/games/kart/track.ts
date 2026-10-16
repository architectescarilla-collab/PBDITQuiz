/**
 * PBDIT Kart tracks: each circuit is a closed spline in the XZ plane, resampled to evenly
 * spaced points. Pure math (no Three.js) so the race engine can run without a renderer.
 */

export interface TrackPoint {
  x: number;
  z: number;
  /** unit tangent (direction of travel) */
  tx: number;
  tz: number;
  /** unit normal, pointing to the racer's LEFT */
  nx: number;
  nz: number;
}

/** Visual theme for a circuit (all daytime). */
export interface TrackTheme {
  skyTop: string;
  horizon: string;
  ground: string;
  groundLine: string;
  road: string;
  accent: string; // curbs, centre line, glow strips
  runoff: string;
  /** relative weights for scenery kinds */
  scenery: { tower: number; dome: number; rack: number; sign: number; tree: number; rock: number; solar: number };
  signs: string[];
}

export interface TrackDef {
  id: string;
  name: string;
  tagline: string;
  difficulty: "Easy" | "Medium" | "Hard";
  control: [number, number][];
  theme: TrackTheme;
}

export interface Track extends TrackDef {
  points: TrackPoint[];
  length: number;
  /** average distance between samples */
  spacing: number;
}

export const ROAD_HALF = 11; // half width of the drivable road
export const WALL = 15; // barrier distance from the centre line (road + run-off strip)
export const TRACK_SAMPLES = 1200;

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function buildTrack(def: TrackDef): Track {
  const control = def.control;
  // 1. dense raw curve
  const raw: [number, number][] = [];
  const n = control.length;
  for (let i = 0; i < n; i++) {
    const p0 = control[(i - 1 + n) % n];
    const p1 = control[i];
    const p2 = control[(i + 1) % n];
    const p3 = control[(i + 2) % n];
    for (let s = 0; s < 60; s++) {
      const t = s / 60;
      raw.push([catmullRom(p0[0], p1[0], p2[0], p3[0], t), catmullRom(p0[1], p1[1], p2[1], p3[1], t)]);
    }
  }
  // 2. cumulative length
  const cum = [0];
  for (let i = 1; i <= raw.length; i++) {
    const a = raw[i - 1];
    const b = raw[i % raw.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[cum.length - 1];
  // 3. evenly spaced resample
  const pts: { x: number; z: number }[] = [];
  let j = 0;
  for (let k = 0; k < TRACK_SAMPLES; k++) {
    const d = (k / TRACK_SAMPLES) * total;
    while (cum[j + 1] < d) j++;
    const a = raw[j];
    const b = raw[(j + 1) % raw.length];
    const f = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
    pts.push({ x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f });
  }
  // 4. tangents + left normals
  const points = pts.map((p, k) => {
    const a = pts[(k - 1 + TRACK_SAMPLES) % TRACK_SAMPLES];
    const b = pts[(k + 1) % TRACK_SAMPLES];
    const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const tx = (b.x - a.x) / len;
    const tz = (b.z - a.z) / len;
    // left of travel direction in a y-up, right-handed world: (tz, -tx)
    return { x: p.x, z: p.z, tx, tz, nx: tz, nz: -tx };
  });
  return { ...def, points, length: total, spacing: total / TRACK_SAMPLES };
}

export const wrap = (i: number) => ((i % TRACK_SAMPLES) + TRACK_SAMPLES) % TRACK_SAMPLES;

/** Nearest track sample to (x, z), searching around a previous index for speed. */
export function nearestIndex(track: Track, x: number, z: number, hint: number, window = 40): number {
  let best = hint;
  let bestD = Infinity;
  for (let o = -window; o <= window; o++) {
    const i = wrap(hint + o);
    const p = track.points[i];
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Signed distance from the centre line (positive = left of travel). */
export function lateralOffset(track: Track, x: number, z: number, i: number): number {
  const p = track.points[i];
  return (x - p.x) * p.nx + (z - p.z) * p.nz;
}

/** World position at track index i, shifted sideways by `lateral`. */
export function pointAt(track: Track, i: number, lateral = 0) {
  const p = track.points[wrap(Math.round(i))];
  return { x: p.x + p.nx * lateral, z: p.z + p.nz * lateral, heading: Math.atan2(p.tz, p.tx) };
}

/* ------------------------------------------------------------------ */
/* The circuits                                                        */
/* ------------------------------------------------------------------ */

const CYBER: TrackDef = {
  id: "cyber-circuit",
  name: "Cyber Circuit",
  tagline: "Glass towers and code billboards on a flowing bean-shaped loop.",
  difficulty: "Medium",
  control: [
    [0, 0],
    [90, 0],
    [150, -15],
    [190, -60],
    [195, -125],
    [160, -175],
    [95, -185],
    [55, -150],
    [30, -105],
    [-15, -95],
    [-60, -130],
    [-120, -140],
    [-170, -105],
    [-180, -45],
    [-150, 5],
    [-90, 25],
    [-40, 15],
  ],
  theme: {
    skyTop: "#5fb8f5",
    horizon: "#e6f4ff",
    ground: "#c9ecd9",
    groundLine: "rgba(255,255,255,0.75)",
    road: "#9aa6b5",
    accent: "#3fd6f5",
    runoff: "#e9f3f0",
    scenery: { tower: 35, dome: 10, rack: 10, sign: 7, tree: 38, rock: 0, solar: 0 },
    signs: [
      "print('go!')",
      "<div>",
      "public class",
      "Console.Write",
      "def race():",
      "</>",
      "{ }",
      "01101",
      "PBDIT",
      "=> fast",
      "import speed",
      "<html>",
    ],
  },
};

const SERVER_FARM: TrackDef = {
  id: "server-farm",
  name: "Server Farm Speedway",
  tagline: "A fast, wide oval through a sunny data centre — great for beginners.",
  difficulty: "Easy",
  control: [
    [0, 0],
    [110, 0],
    [200, 0],
    [255, -30],
    [270, -95],
    [240, -155],
    [170, -175],
    [110, -160],
    [60, -175],
    [-10, -175],
    [-75, -150],
    [-100, -90],
    [-80, -30],
  ],
  theme: {
    skyTop: "#7cc4f2",
    horizon: "#eef3ff",
    ground: "#d9e2f2",
    groundLine: "rgba(255,255,255,0.8)",
    road: "#a3a9bd",
    accent: "#8b7cf6",
    runoff: "#eeeefa",
    scenery: { tower: 10, dome: 18, rack: 45, sign: 8, tree: 19, rock: 0, solar: 0 },
    signs: [
      "SELECT *",
      "200 OK",
      "ping 8.8.8.8",
      "uptime 99.9%",
      "localhost",
      "</>",
      "sudo race",
      "cloud ☁",
      "git push",
      "PBDIT",
    ],
  },
};

const CANYON: TrackDef = {
  id: "silicon-canyon",
  name: "Silicon Canyon",
  tagline: "Tight hairpins and switchbacks under the desert sun — for experts.",
  difficulty: "Hard",
  control: [
    [0, 0],
    [75, 0],
    [125, 20],
    [155, 68],
    [140, 108],
    [105, 124],
    [75, 126],
    [46, 140],
    [36, 167],
    [50, 194],
    [85, 208],
    [140, 215],
    [210, 190],
    [255, 125],
    [265, 45],
    [245, -30],
    [195, -80],
    [125, -98],
    [84, -90],
    [54, -102],
    [32, -120],
    [4, -134],
    [-28, -136],
    [-80, -110],
    [-95, -50],
    [-60, -5],
  ],
  theme: {
    skyTop: "#62b3ef",
    horizon: "#fdf1dc",
    ground: "#ecd7b4",
    groundLine: "rgba(255,255,255,0.55)",
    road: "#a89f94",
    accent: "#f29b38",
    runoff: "#f5e9d6",
    scenery: { tower: 12, dome: 6, rack: 4, sign: 7, tree: 16, rock: 35, solar: 20 },
    signs: ["while(true)", "if (fast)", "break;", "return 0;", "try { }", "</>", "chip.exe", "{ }", "PBDIT", "async"],
  },
};

export const TRACK_DEFS: TrackDef[] = [CYBER, SERVER_FARM, CANYON];
const cache = new Map<string, Track>();

export function getTrack(id: string): Track {
  let t = cache.get(id);
  if (!t) {
    const def = TRACK_DEFS.find((d) => d.id === id) ?? TRACK_DEFS[0];
    t = buildTrack(def);
    cache.set(def.id, t);
  }
  return t;
}
