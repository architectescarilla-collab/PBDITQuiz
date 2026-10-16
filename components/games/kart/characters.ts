/**
 * PBDIT Kart cast — simple, friendly characters built from Three.js primitives.
 * Every model faces +X (the engine's heading 0) and sits on y = 0.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CharId } from "./engine.ts";

export interface CharInfo {
  id: CharId;
  name: string;
  creature: string;
  emoji: string;
  blurb: string;
  color: string; // kart body
  accent: string; // trim
}

export const CAST: Record<CharId, CharInfo> = {
  python: {
    id: "python",
    name: "Python",
    creature: "Snake",
    emoji: "🐍",
    blurb: "Quick off the line — readable and slithery.",
    color: "#3776ab",
    accent: "#ffd43b",
  },
  html: {
    id: "html",
    name: "HTML",
    creature: "Spider",
    emoji: "🕷️",
    blurb: "Spins the web — best grip in the corners.",
    color: "#e34f26",
    accent: "#f5f5f5",
  },
  csharp: {
    id: "csharp",
    name: "C#",
    creature: "Shark",
    emoji: "🦈",
    blurb: "C-sharp teeth — strong top speed.",
    color: "#68217a",
    accent: "#b98ce0",
  },
  java: {
    id: "java",
    name: "Java",
    creature: "Coffee cup",
    emoji: "☕",
    blurb: "Heavy brew — highest top speed, pushes others around.",
    color: "#e76f00",
    accent: "#5382a1",
  },
};

// Materials are shared by colour + options so identical parts can be merged into one draw call.
const materials = new Map<string, THREE.MeshStandardMaterial>();
const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
  const key = color + JSON.stringify(opts);
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...opts });
    materials.set(key, m);
  }
  return m;
};

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  return o;
}

function eyes(group: THREE.Object3D, x: number, y: number, spread: number, size = 0.16) {
  const white = mat("#ffffff", { roughness: 0.3 });
  const black = mat("#1b1b1b", { roughness: 0.2 });
  for (const s of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(size, 16, 12), white, x, y, s * spread));
    group.add(mesh(new THREE.SphereGeometry(size * 0.55, 12, 10), black, x + size * 0.6, y + size * 0.1, s * spread));
  }
}

/**
 * Merges every non-animated mesh under `root` into one mesh per material (fewer draw calls).
 * Subtrees marked `userData.animated` are left alone so they can still move.
 */
function batch(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const merged: THREE.Mesh[] = [];
  const walk = (o: THREE.Object3D) => {
    for (const c of o.children) {
      if (c.userData.animated) continue;
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.Material;
        if (!buckets.has(mat)) buckets.set(mat, []);
        buckets.get(mat)!.push(m.geometry.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld)));
        merged.push(m);
      }
      walk(c);
    }
  };
  walk(root);
  for (const m of merged) {
    m.parent?.remove(m);
    m.geometry.dispose();
  }
  for (const [mat, geos] of buckets) {
    const g = mergeGeometries(geos);
    geos.forEach((x) => x.dispose());
    if (g) root.add(new THREE.Mesh(g, mat));
  }
}

/** The kart chassis every character drives. */
function kart(info: CharInfo) {
  const g = new THREE.Group();
  const body = mat(info.color, { metalness: 0.25, roughness: 0.35 });
  const trim = mat(info.accent, { roughness: 0.4 });
  const dark = mat("#2b2b30", { roughness: 0.8 });
  const glow = mat("#5fe3ff", { emissive: new THREE.Color("#5fe3ff"), emissiveIntensity: 0.9 });

  g.add(mesh(new THREE.BoxGeometry(3.0, 0.45, 1.7), body, 0, 0.55, 0)); // floor pan
  const nose = mesh(new THREE.BoxGeometry(0.9, 0.35, 1.3), body, 1.7, 0.5, 0);
  nose.rotation.z = -0.25;
  g.add(nose);
  g.add(mesh(new THREE.BoxGeometry(0.25, 0.12, 1.9), trim, 2.05, 0.38, 0)); // front bumper
  g.add(mesh(new THREE.BoxGeometry(0.9, 0.5, 1.2), body, -0.6, 0.95, 0)); // seat back
  // spoiler
  g.add(mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), dark, -1.35, 1.1, 0.55));
  g.add(mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), dark, -1.35, 1.1, -0.55));
  g.add(mesh(new THREE.BoxGeometry(0.55, 0.1, 1.9), trim, -1.4, 1.42, 0));
  // glowing side strips (futuristic, still daytime friendly)
  g.add(mesh(new THREE.BoxGeometry(2.6, 0.08, 0.05), glow, 0, 0.6, 0.88));
  g.add(mesh(new THREE.BoxGeometry(2.6, 0.08, 0.05), glow, 0, 0.6, -0.88));
  // steering wheel
  const wheel = mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 20), dark, 0.75, 1.15, 0);
  wheel.rotation.y = Math.PI / 2;
  wheel.rotation.x = 0.3;
  g.add(wheel);
  // wheels
  const tire = new THREE.CylinderGeometry(0.45, 0.45, 0.42, 20);
  tire.rotateX(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(0.2, 0.2, 0.44, 12);
  hub.rotateX(Math.PI / 2);
  const wheels: THREE.Object3D[] = [];
  for (const [x, z] of [
    [1.15, 1.0],
    [1.15, -1.0],
    [-1.05, 1.05],
    [-1.05, -1.05],
  ]) {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(tire, dark));
    w.add(new THREE.Mesh(hub, trim));
    w.position.set(x, 0.45, z);
    batch(w); // tire + hub spin together
    w.userData.animated = true;
    g.add(w);
    wheels.push(w);
  }
  g.userData.wheels = wheels;
  return g;
}

function python(info: CharInfo) {
  const g = new THREE.Group();
  const blue = mat(info.color, { roughness: 0.4 });
  const yellow = mat(info.accent, { roughness: 0.4 });
  // coiled body rising from the seat
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * Math.PI * 3.2;
    const r = 0.55 - t * 0.25;
    pts.push(new THREE.Vector3(-0.15 + Math.cos(a) * r, 0.95 + t * 1.25, Math.sin(a) * r));
  }
  const coil = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(coil, 80, 0.24, 12, false), blue));
  // yellow belly stripe
  const belly = new THREE.Mesh(new THREE.TubeGeometry(coil, 80, 0.12, 8, false), yellow);
  belly.position.set(0.06, -0.08, 0);
  g.add(belly);
  const head = new THREE.Group();
  const skull = mesh(new THREE.SphereGeometry(0.42, 20, 16), blue);
  skull.scale.set(1.35, 0.85, 1);
  head.add(skull);
  const jaw = mesh(new THREE.SphereGeometry(0.3, 16, 12), yellow, 0.25, -0.12, 0);
  jaw.scale.set(1.2, 0.6, 1);
  head.add(jaw);
  eyes(head, 0.25, 0.2, 0.2, 0.13);
  const tongue = new THREE.Group();
  const red = mat("#d7263d");
  tongue.add(mesh(new THREE.BoxGeometry(0.35, 0.03, 0.05), red, 0.17, 0, 0));
  for (const s of [-1, 1]) {
    const fork = mesh(new THREE.BoxGeometry(0.15, 0.03, 0.04), red, 0.38, 0, s * 0.04);
    fork.rotation.y = s * 0.5;
    tongue.add(fork);
  }
  tongue.position.set(0.5, -0.12, 0);
  tongue.userData.animated = true;
  head.add(tongue);
  head.position.set(0.25, 2.35, 0);
  batch(head);
  head.userData.animated = true;
  g.add(head);
  g.userData.anim = (t: number) => {
    tongue.scale.x = Math.sin(t * 9) > 0.6 ? 1 : 0.2;
    head.rotation.z = Math.sin(t * 2.2) * 0.08;
  };
  return g;
}

function html(info: CharInfo) {
  const g = new THREE.Group();
  const orange = mat(info.color, { roughness: 0.5 });
  const dark = mat("#3a1d12", { roughness: 0.7 });
  const white = mat("#ffffff");
  const abdomen = mesh(new THREE.SphereGeometry(0.62, 20, 16), orange, -0.55, 1.45, 0);
  abdomen.scale.set(1.15, 0.95, 1);
  g.add(abdomen);
  // "</>" mark on the back, as three little bars
  for (const [y, z, r] of [
    [1.6, 0.2, 0.6],
    [1.6, -0.2, -0.6],
    [1.6, 0, 0.35],
  ] as const) {
    const bar = mesh(new THREE.BoxGeometry(0.08, 0.32, 0.06), white, -1.12, y, z);
    bar.rotation.x = r;
    g.add(bar);
  }
  const head = mesh(new THREE.SphereGeometry(0.42, 18, 14), orange, 0.15, 1.55, 0);
  g.add(head);
  eyes(g, 0.48, 1.72, 0.14, 0.11);
  eyes(g, 0.45, 1.5, 0.27, 0.07);
  // fangs
  for (const s of [-1, 1]) {
    const f = mesh(new THREE.ConeGeometry(0.05, 0.2, 6), white, 0.52, 1.25, s * 0.09);
    f.rotation.z = Math.PI;
    g.add(f);
  }
  // eight jointed legs
  const legs: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    for (const s of [-1, 1]) {
      const leg = new THREE.Group();
      const upper = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), dark, 0, 0.35, 0);
      upper.rotation.x = 0.9;
      leg.add(upper);
      const lower = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.9, 8), dark, 0, 0.35, 0.95);
      lower.rotation.x = -0.4;
      leg.add(lower);
      leg.position.set(0.3 - i * 0.32, 1.4, s * 0.3);
      leg.rotation.y = s === 1 ? (i - 1.5) * 0.35 : Math.PI - (i - 1.5) * 0.35;
      batch(leg);
      leg.userData.animated = true;
      g.add(leg);
      legs.push(leg);
    }
  }
  g.userData.anim = (t: number) => {
    legs.forEach((l, i) => (l.rotation.z = Math.sin(t * 7 + i) * 0.15));
  };
  return g;
}

function csharp(info: CharInfo) {
  const g = new THREE.Group();
  const purple = mat(info.color, { roughness: 0.35 });
  const belly = mat("#ece6f5", { roughness: 0.5 });
  const shark = new THREE.Group();
  // upright torpedo body with a pointed snout facing forward (+X)
  const body = mesh(new THREE.SphereGeometry(0.6, 24, 18), purple);
  body.scale.set(1.0, 1.55, 0.85);
  shark.add(body);
  const snout = mesh(new THREE.ConeGeometry(0.42, 0.75, 20), purple, 0.42, 0.55, 0);
  snout.rotation.z = -Math.PI / 2 + 0.35;
  snout.scale.z = 0.85;
  shark.add(snout);
  // white belly, pushed out so it shows on the front
  const front = mesh(new THREE.SphereGeometry(0.5, 20, 14), belly, 0.36, -0.2, 0);
  front.scale.set(0.55, 1.3, 0.75);
  shark.add(front);
  // big dorsal fin on the back, pointing up and back
  const fin = mesh(new THREE.ConeGeometry(0.34, 0.95, 4), purple, -0.32, 1.05, 0);
  fin.rotation.z = 0.55;
  fin.scale.z = 0.3;
  shark.add(fin);
  // side flippers
  for (const s of [-1, 1]) {
    const flipper = mesh(new THREE.ConeGeometry(0.2, 0.7, 4), purple, 0.05, -0.2, s * 0.58);
    flipper.rotation.set(s * 1.3, 0, -0.6);
    flipper.scale.z = 0.3;
    shark.add(flipper);
  }
  eyes(shark, 0.5, 0.62, 0.27, 0.13);
  // toothy grin under the snout
  shark.add(mesh(new THREE.BoxGeometry(0.08, 0.1, 0.62), mat("#2d0f36"), 0.66, 0.22, 0));
  for (let i = 0; i < 6; i++) {
    const tooth = mesh(new THREE.ConeGeometry(0.045, 0.13, 4), mat("#ffffff"), 0.7, 0.24, -0.25 + i * 0.1);
    tooth.rotation.z = Math.PI;
    shark.add(tooth);
  }
  // "#" badge on the belly
  const hash = mat(info.accent, { emissive: new THREE.Color(info.accent), emissiveIntensity: 0.3 });
  for (const z of [-0.07, 0.07]) shark.add(mesh(new THREE.BoxGeometry(0.04, 0.32, 0.045), hash, 0.64, -0.3, z));
  for (const y of [-0.22, -0.38]) shark.add(mesh(new THREE.BoxGeometry(0.04, 0.045, 0.32), hash, 0.64, y, 0));
  shark.position.set(-0.25, 1.75, 0);
  shark.rotation.z = -0.12;
  batch(shark);
  shark.userData.animated = true;
  g.add(shark);
  g.userData.anim = (t: number) => {
    shark.rotation.x = Math.sin(t * 2.5) * 0.06;
  };
  return g;
}

function java(info: CharInfo) {
  const g = new THREE.Group();
  const cupMat = mat("#fbf7f0", { roughness: 0.3 });
  const band = mat(info.color, { roughness: 0.4 });
  const blue = mat(info.accent, { roughness: 0.4 });
  const cup = new THREE.Group();
  cup.add(mesh(new THREE.CylinderGeometry(0.62, 0.5, 1.25, 28), cupMat));
  cup.add(mesh(new THREE.CylinderGeometry(0.635, 0.6, 0.28, 28), band, 0, 0.18, 0));
  cup.add(mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 28), mat("#5b3a24", { roughness: 0.2 }), 0, 0.6, 0));
  const handle = mesh(new THREE.TorusGeometry(0.3, 0.08, 10, 20, Math.PI * 1.3), blue, -0.65, 0, 0);
  handle.rotation.z = Math.PI * 0.35;
  cup.add(handle);
  eyes(cup, 0.5, 0.0, 0.18, 0.12);
  const smile = mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16, Math.PI), mat("#3b2416"), 0.56, -0.28, 0);
  smile.rotation.set(Math.PI, Math.PI / 2, 0);
  cup.add(smile);
  cup.position.set(-0.25, 1.55, 0);
  g.add(cup);
  // steam wisps
  const steam: THREE.Mesh[] = [];
  const steamMat = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.6, roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const p = mesh(new THREE.SphereGeometry(0.15, 10, 8), steamMat, -0.25 + (i % 2 ? 0.12 : -0.12), 2.3, 0);
    p.userData.animated = true;
    g.add(p);
    steam.push(p);
  }
  g.userData.anim = (t: number) => {
    steam.forEach((p, i) => {
      const k = (t * 0.6 + i / steam.length) % 1;
      p.position.y = 2.25 + k * 1.1;
      p.position.z = Math.sin(t * 2 + i) * 0.12;
      p.scale.setScalar(0.6 + k * 1.1);
    });
    steamMat.opacity = 0.45;
  };
  return g;
}

const DRIVERS: Record<CharId, (i: CharInfo) => THREE.Group> = { python, html, csharp, java };

/** Builds a full racer: kart + driver. Returns the root group (forward = +X). */
export function buildRacer(id: CharId): THREE.Group {
  const info = CAST[id];
  const root = new THREE.Group();
  const k = kart(info);
  const driver = DRIVERS[id](info);
  root.add(k);
  root.add(driver);
  root.userData.wheels = k.userData.wheels;
  root.userData.anim = driver.userData.anim;
  root.userData.driver = driver;
  batch(root);
  return root;
}
