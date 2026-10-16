/**
 * PBDIT Kart track: a closed spline in the XZ plane, resampled to evenly spaced points.
 * Pure math, no Three.js, so the race engine can run (and be tested) without a renderer.
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

export const ROAD_HALF = 11; // half width of the drivable road
export const WALL = 15; // barrier distance from the centre line (road + run-off strip)

/** Control points of the circuit (x, z). Drawn clockwise when viewed from above. */
const CONTROL: [number, number][] = [
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
];

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function buildTrack(samples: number): TrackPoint[] {
  // 1. dense raw curve
  const raw: [number, number][] = [];
  const n = CONTROL.length;
  for (let i = 0; i < n; i++) {
    const p0 = CONTROL[(i - 1 + n) % n];
    const p1 = CONTROL[i];
    const p2 = CONTROL[(i + 1) % n];
    const p3 = CONTROL[(i + 2) % n];
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
  for (let k = 0; k < samples; k++) {
    const d = (k / samples) * total;
    while (cum[j + 1] < d) j++;
    const a = raw[j];
    const b = raw[(j + 1) % raw.length];
    const f = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
    pts.push({ x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f });
  }
  // 4. tangents + left normals
  return pts.map((p, k) => {
    const a = pts[(k - 1 + samples) % samples];
    const b = pts[(k + 1) % samples];
    const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const tx = (b.x - a.x) / len;
    const tz = (b.z - a.z) / len;
    // left of travel direction in a y-up, right-handed world: (tz, -tx)
    return { x: p.x, z: p.z, tx, tz, nx: tz, nz: -tx };
  });
}

export const TRACK_SAMPLES = 1200;
export const TRACK: TrackPoint[] = buildTrack(TRACK_SAMPLES);
export const TRACK_LENGTH = TRACK.reduce((sum, p, i) => {
  const q = TRACK[(i + 1) % TRACK.length];
  return sum + Math.hypot(q.x - p.x, q.z - p.z);
}, 0);

export const wrap = (i: number) => ((i % TRACK_SAMPLES) + TRACK_SAMPLES) % TRACK_SAMPLES;

/** Nearest track sample to (x, z), searching around a previous index for speed. */
export function nearestIndex(x: number, z: number, hint: number, window = 40): number {
  let best = hint;
  let bestD = Infinity;
  for (let o = -window; o <= window; o++) {
    const i = wrap(hint + o);
    const p = TRACK[i];
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Signed distance from the centre line (positive = left of travel). */
export function lateralOffset(x: number, z: number, i: number): number {
  const p = TRACK[i];
  return (x - p.x) * p.nx + (z - p.z) * p.nz;
}

/** World position at track index i, shifted sideways by `lateral`. */
export function pointAt(i: number, lateral = 0) {
  const p = TRACK[wrap(Math.round(i))];
  return { x: p.x + p.nx * lateral, z: p.z + p.nz * lateral, heading: Math.atan2(p.tz, p.tx) };
}
