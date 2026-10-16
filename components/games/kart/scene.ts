/**
 * PBDIT Kart renderer: a bright, daytime "cyber circuit" built with Three.js,
 * plus the karts, item boxes, power-up effects and the chase camera.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildRacer, CAST } from "./characters.ts";
import type { Race, RaceEvent, Racer } from "./engine.ts";
import { ROAD_HALF, WALL, type Track, type TrackPoint } from "./track.ts";

/* ------------------------------------------------------------------ */
/* Canvas textures                                                     */
/* ------------------------------------------------------------------ */

function canvasTexture(w: number, h: number, paint: (c: CanvasRenderingContext2D) => void, repeat = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  paint(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function roadTexture(road: string, accent: string) {
  return canvasTexture(256, 256, (c) => {
    c.fillStyle = road;
    c.fillRect(0, 0, 256, 256);
    // subtle "circuit traces"
    c.strokeStyle = "rgba(255,255,255,0.16)";
    c.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 36;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 90 + (i % 3) * 30);
      c.lineTo(x + 18, 120 + (i % 3) * 30);
      c.lineTo(x + 18, 256);
      c.stroke();
      c.fillStyle = "rgba(255,255,255,0.22)";
      c.beginPath();
      c.arc(x + 18, 120 + (i % 3) * 30, 5, 0, Math.PI * 2);
      c.fill();
    }
    // edge lines + centre dashes
    c.fillStyle = "#ffffff";
    c.fillRect(6, 0, 7, 256);
    c.fillRect(243, 0, 7, 256);
    c.fillStyle = accent;
    c.fillRect(124, 0, 8, 120);
  });
}

function curbTexture(accent: string) {
  return canvasTexture(32, 64, (c) => {
    c.fillStyle = accent;
    c.fillRect(0, 0, 32, 32);
    c.fillStyle = "#ffffff";
    c.fillRect(0, 32, 32, 32);
  });
}

function gridTexture(base: string, line: string, size = 128) {
  return canvasTexture(size, size, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, size, size);
    c.strokeStyle = line;
    c.lineWidth = 2;
    c.strokeRect(0, 0, size, size);
    c.beginPath();
    c.moveTo(size / 2, 0);
    c.lineTo(size / 2, size);
    c.moveTo(0, size / 2);
    c.lineTo(size, size / 2);
    c.globalAlpha = 0.4;
    c.stroke();
  });
}

function textTexture(
  text: string,
  opts: { w?: number; h?: number; bg?: string; fg?: string; font?: string; border?: string } = {},
) {
  const {
    w = 512,
    h = 192,
    bg = "rgba(255,255,255,0.85)",
    fg = "#11506b",
    font = "bold 84px monospace",
    border,
  } = opts;
  return canvasTexture(
    w,
    h,
    (c) => {
      c.fillStyle = bg;
      c.beginPath();
      c.roundRect(4, 4, w - 8, h - 8, 28);
      c.fill();
      if (border) {
        c.strokeStyle = border;
        c.lineWidth = 8;
        c.stroke();
      }
      c.fillStyle = fg;
      c.font = font;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, w / 2, h / 2 + 4);
    },
    false,
  );
}

/* ------------------------------------------------------------------ */
/* Track geometry                                                      */
/* ------------------------------------------------------------------ */

/** A flat ribbon between two lateral offsets along the whole track. */
function ribbon(pts: TrackPoint[], inner: number, outer: number, y: number, vScale: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let dist = 0;
  const n = pts.length;
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n];
    if (i > 0) {
      const q = pts[i - 1];
      dist += Math.hypot(p.x - q.x, p.z - q.z);
    }
    pos.push(p.x + p.nx * inner, y, p.z + p.nz * inner, p.x + p.nx * outer, y, p.z + p.nz * outer);
    uv.push(0, dist / vScale, 1, dist / vScale);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A vertical wall ribbon at a lateral offset. */
function wall(pts: TrackPoint[], lateral: number, y0: number, y1: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  const n = pts.length;
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n];
    const x = p.x + p.nx * lateral;
    const z = p.z + p.nz * lateral;
    pos.push(x, y0, z, x, y1, z);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

function nearTrack(pts: TrackPoint[], x: number, z: number, margin: number) {
  for (let i = 0; i < pts.length; i += 4) {
    const p = pts[i];
    if ((p.x - x) ** 2 + (p.z - z) ** 2 < margin * margin) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

function buildWorld(scene: THREE.Scene, track: Track) {
  const pts = track.points;
  const th = track.theme;
  const HORIZON = new THREE.Color(th.horizon);
  const SKY_TOP = new THREE.Color(th.skyTop);
  scene.fog = new THREE.Fog(HORIZON, 260, 760);

  // sky dome
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: SKY_TOP }, bottom: { value: HORIZON } },
      vertexShader:
        "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y * 1.6, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }",
    }),
  );
  scene.add(sky);

  scene.add(new THREE.HemisphereLight("#ffffff", "#b9e4c9", 1.35));
  const sun = new THREE.DirectionalLight("#fff6e0", 1.6);
  sun.position.set(120, 220, 80);
  scene.add(sun);

  // ground: a pale mint "data grid"
  const groundTex = gridTexture(th.ground, th.groundLine);
  groundTex.repeat.set(160, 160);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1600),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);

  // road, curbs and run-off
  const road = new THREE.MeshStandardMaterial({ map: roadTexture(th.road, th.accent), roughness: 0.85 });
  scene.add(new THREE.Mesh(ribbon(pts, -ROAD_HALF, ROAD_HALF, 0.02, ROAD_HALF * 2), road));
  const curbMat = new THREE.MeshStandardMaterial({ map: curbTexture(th.accent), roughness: 0.7 });
  scene.add(new THREE.Mesh(ribbon(pts, ROAD_HALF, ROAD_HALF + 1.4, 0.04, 4), curbMat));
  scene.add(new THREE.Mesh(ribbon(pts, -ROAD_HALF - 1.4, -ROAD_HALF, 0.04, 4), curbMat));
  const runTex = gridTexture(th.runoff, "rgba(120,170,190,0.45)", 64);
  const runMat = new THREE.MeshStandardMaterial({ map: runTex, roughness: 0.9 });
  scene.add(new THREE.Mesh(ribbon(pts, ROAD_HALF + 1.4, WALL, 0.03, 4), runMat));
  scene.add(new THREE.Mesh(ribbon(pts, -WALL, -ROAD_HALF - 1.4, 0.03, 4), runMat));

  // glass barriers with a white top rail
  const glass = new THREE.MeshStandardMaterial({
    color: "#8fe3f2",
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.2,
  });
  const rail = new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide, roughness: 0.4 });
  for (const s of [-1, 1]) {
    scene.add(new THREE.Mesh(wall(pts, s * WALL, 0, 1.3), glass));
    scene.add(new THREE.Mesh(wall(pts, s * WALL, 1.3, 1.6), rail));
  }

  // start / finish line + gantry
  const start = pts[0];
  const heading = Math.atan2(start.tz, start.tx);
  // checkered line: 2 squares along the direction of travel (local X), 16 across the road (local Z)
  const checker = canvasTexture(
    32,
    256,
    (c) => {
      for (let x = 0; x < 2; x++)
        for (let y = 0; y < 16; y++) {
          c.fillStyle = (x + y) % 2 ? "#1d2733" : "#ffffff";
          c.fillRect(x * 16, y * 16, 16, 16);
        }
    },
    false,
  );
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, ROAD_HALF * 2),
    new THREE.MeshStandardMaterial({ map: checker }),
  );
  line.rotation.x = -Math.PI / 2;
  const lineGroup = new THREE.Group();
  lineGroup.add(line);
  lineGroup.position.set(start.x, 0.05, start.z);
  lineGroup.rotation.y = -heading;
  scene.add(lineGroup);

  const gantry = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: "#f4f8fb", roughness: 0.35, metalness: 0.3 });
  const cyan = new THREE.MeshStandardMaterial({ color: th.accent, emissive: th.accent, emissiveIntensity: 0.6 });
  for (const s of [-1, 1]) {
    gantry.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 11, 1.2), white), 0, 5.5, s * (WALL + 0.8)));
    gantry.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 1.3), cyan), 0, 9, s * (WALL + 0.8)));
  }
  gantry.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, WALL * 2 + 2.8), white), 0, 11, 0));
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(WALL * 1.6, 2.2),
    new THREE.MeshBasicMaterial({
      map: textTexture("PBDIT KART", { w: 1024, h: 160, bg: "#11506b", fg: "#ffffff", font: "900 110px sans-serif" }),
      side: THREE.DoubleSide,
    }),
  );
  banner.position.set(-0.62, 11, 0);
  banner.rotation.y = -Math.PI / 2;
  gantry.add(banner);
  const banner2 = banner.clone();
  banner2.position.x = 0.62;
  banner2.rotation.y = Math.PI / 2;
  gantry.add(banner2);
  gantry.position.set(start.x, 0, start.z);
  gantry.rotation.y = -heading;
  scene.add(gantry);

  // Static scenery is batched: meshes sharing a material are merged into one draw call.
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const addStatic = (o: THREE.Object3D) => {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material;
      if (!buckets.has(mat)) buckets.set(mat, []);
      buckets.get(mat)!.push(m.geometry.clone().applyMatrix4(m.matrixWorld));
      m.geometry.dispose();
    });
  };

  // scenery around (and inside) the circuit
  const xs = pts.map((p) => p.x);
  const zs = pts.map((p) => p.z);
  const [minX, maxX, minZ, maxZ] = [
    Math.min(...xs) - 140,
    Math.max(...xs) + 140,
    Math.min(...zs) - 140,
    Math.max(...zs) + 140,
  ];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const glassTex = canvasTexture(64, 128, (c) => {
    c.fillStyle = "#f2f6f9";
    c.fillRect(0, 0, 64, 128);
    c.fillStyle = "#9fd6ec";
    for (let y = 6; y < 128; y += 16) c.fillRect(6, y, 52, 9);
  });
  const towerMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.3, metalness: 0.2 });
  const domeMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25, metalness: 0.15 });
  const rackMat = new THREE.MeshStandardMaterial({ color: "#5d6b7a", roughness: 0.5, metalness: 0.4 });
  const leafMat = new THREE.MeshStandardMaterial({ color: "#56c2a3", roughness: 0.8 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: "#d7d2c8", roughness: 0.8 });
  const rockMat = new THREE.MeshStandardMaterial({ color: "#d9a877", roughness: 0.95 });
  const rockMat2 = new THREE.MeshStandardMaterial({ color: "#c98f62", roughness: 0.95 });
  const solarMat = new THREE.MeshStandardMaterial({ color: "#2f4f7a", roughness: 0.25, metalness: 0.6 });
  type Kind = keyof typeof th.scenery;
  const weights = Object.entries(th.scenery) as [Kind, number][];
  const totalW = weights.reduce((n, [, w]) => n + w, 0);
  const pickKind = (r: number): Kind => {
    let v = r * totalW;
    for (const [k, w] of weights) {
      v -= w;
      if (v <= 0) return k;
    }
    return "tree";
  };
  const signs: THREE.Object3D[] = [];
  let placed = 0;
  for (let tries = 0; tries < 1400 && placed < 150; tries++) {
    const x = minX + rnd() * (maxX - minX);
    const z = minZ + rnd() * (maxZ - minZ);
    const kind = pickKind(rnd());
    const margin = kind === "tower" || kind === "rock" ? WALL + 22 : WALL + 9;
    if (nearTrack(pts, x, z, margin)) continue;
    placed++;
    if (kind === "tower") {
      const h = 25 + rnd() * 70;
      const w = 9 + rnd() * 9;
      const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), towerMat);
      t.position.set(x, h / 2, z);
      t.rotation.y = rnd() * Math.PI;
      addStatic(t);
      if (rnd() < 0.6) {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.45, w * 0.45, 1.2, 24), cyan);
        crown.position.set(x, h + 0.6, z);
        addStatic(crown);
      }
    } else if (kind === "dome") {
      const r = 6 + rnd() * 8;
      const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      d.position.set(x, 0, z);
      addStatic(d);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.35, 8, 32), cyan);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.4, z);
      addStatic(ring);
    } else if (kind === "rack") {
      const h = 6 + rnd() * 6;
      const m = new THREE.Mesh(new THREE.BoxGeometry(3, h, 2), rackMat);
      m.position.set(x, h / 2, z);
      m.rotation.y = rnd() * Math.PI;
      addStatic(m);
      for (let k = 0; k < 3; k++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.2, 2.05), cyan);
        led.position.set(x, 1.5 + k * (h / 3.2), z);
        led.rotation.y = m.rotation.y;
        addStatic(led);
      }
    } else if (kind === "rock") {
      // layered desert mesa
      const r = 7 + rnd() * 9;
      const h = 8 + rnd() * 16;
      for (let k = 0; k < 3; k++) {
        const layer = new THREE.Mesh(
          new THREE.CylinderGeometry(r * (0.75 - k * 0.15), r * (0.85 - k * 0.15), h / 3, 7),
          k % 2 ? rockMat2 : rockMat,
        );
        layer.position.set(x, (h / 3) * (k + 0.5), z);
        layer.rotation.y = rnd() * Math.PI;
        addStatic(layer);
      }
    } else if (kind === "solar") {
      // a small field of tilted solar panels
      const yaw = rnd() * Math.PI;
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 2; b++) {
          const ox = (a - 1) * 5.5;
          const oz = (b - 0.5) * 6;
          const px = x + Math.cos(yaw) * ox - Math.sin(yaw) * oz;
          const pz = z + Math.sin(yaw) * ox + Math.cos(yaw) * oz;
          const panel = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 3.2), solarMat);
          panel.position.set(px, 1.6, pz);
          panel.rotation.set(0.45, yaw, 0, "YXZ");
          addStatic(panel);
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 6), trunkMat);
          post.position.set(px, 0.8, pz);
          addStatic(post);
        }
      }
    } else if (kind === "sign" && signs.length < 14) {
      // floating hologram billboard showing code
      const sign = new THREE.Group();
      const text = th.signs[signs.length % th.signs.length];
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 5.2),
        new THREE.MeshBasicMaterial({
          map: textTexture(text, { bg: "rgba(255,255,255,0.78)", fg: "#0f6e8c", border: th.accent }),
          transparent: true,
          side: THREE.DoubleSide,
        }),
      );
      panel.position.y = 9;
      sign.add(panel);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6.5, 8), domeMat);
      pole.position.y = 3.2;
      sign.add(pole);
      sign.position.set(x, 0, z);
      // face the nearest piece of track
      let best = pts[0];
      let bd = Infinity;
      for (let i = 0; i < pts.length; i += 6) {
        const d = (pts[i].x - x) ** 2 + (pts[i].z - z) ** 2;
        if (d < bd) {
          bd = d;
          best = pts[i];
        }
      }
      sign.lookAt(best.x, 0, best.z);
      scene.add(sign);
      signs.push(panel);
    } else {
      const h = 3 + rnd() * 4;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, h * 0.4, 8), trunkMat);
      trunk.position.set(x, h * 0.2, z);
      addStatic(trunk);
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(h * 0.35, h, 8), leafMat);
      leaf.position.set(x, h * 0.4 + h / 2, z);
      addStatic(leaf);
    }
  }

  // puffy clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 1,
    transparent: true,
    opacity: 0.92,
    fog: false,
  });
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(8 + rnd() * 8, 12, 10), cloudMat);
      puff.position.set(k * 9 - 18, rnd() * 4, rnd() * 8);
      c.add(puff);
    }
    const a = rnd() * Math.PI * 2;
    const r = 380 + rnd() * 260;
    c.position.set(Math.cos(a) * r, 120 + rnd() * 80, Math.sin(a) * r);
    c.scale.y = 0.6;
    addStatic(c);
  }

  for (const [mat, geos] of buckets) {
    const merged = mergeGeometries(geos);
    geos.forEach((g) => g.dispose());
    if (merged) scene.add(new THREE.Mesh(merged, mat));
  }
  return { signs };
}

/* ------------------------------------------------------------------ */
/* Per-racer visuals                                                   */
/* ------------------------------------------------------------------ */

interface RacerView {
  root: THREE.Group;
  model: THREE.Group;
  shield: THREE.Mesh;
  ice: THREE.Mesh;
  flames: THREE.Mesh[];
  sparks: THREE.Mesh[];
  label: THREE.Sprite | null;
}

function nameSprite(text: string, color: string) {
  const tex = textTexture(text, { w: 256, h: 96, bg: color, fg: "#ffffff", font: "bold 56px sans-serif" });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(1.8, 0.68, 1);
  s.position.set(0, 4, 0);
  s.renderOrder = 10;
  return s;
}

function makeRacerView(r: Racer): RacerView {
  const root = new THREE.Group();
  const model = buildRacer(r.char);
  root.add(model);

  // soft blob shadow (cheaper than shadow maps, fine on phones)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 24),
    new THREE.MeshBasicMaterial({ color: "#1d3a4a", transparent: true, opacity: 0.25, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.06;
  shadow.scale.set(1.3, 0.8, 1);
  root.add(shadow);

  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 16),
    new THREE.MeshStandardMaterial({
      color: "#5fe3ff",
      transparent: true,
      opacity: 0.28,
      emissive: "#3fd6f5",
      emissiveIntensity: 0.5,
      depthWrite: false,
    }),
  );
  shield.position.y = 1.3;
  shield.visible = false;
  root.add(shield);

  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 3.4, 2.8),
    new THREE.MeshStandardMaterial({
      color: "#d8f6ff",
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      metalness: 0.1,
      depthWrite: false,
    }),
  );
  ice.position.y = 1.6;
  ice.visible = false;
  root.add(ice);

  const flameMat = new THREE.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.85 });
  const flames = [-0.45, 0.45].map((z) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.6, 10), flameMat);
    f.rotation.z = Math.PI / 2;
    f.position.set(-2.0, 0.65, z);
    f.visible = false;
    root.add(f);
    return f;
  });
  const sparkMat = new THREE.MeshBasicMaterial({ color: "#7fe7ff" });
  const sparks = [-1.05, 1.05].flatMap((z) =>
    [0, 1, 2].map((k) => {
      const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.16), sparkMat);
      s.position.set(-1.4 - k * 0.3, 0.2, z);
      s.visible = false;
      root.add(s);
      return s;
    }),
  );

  const label = r.isPlayer ? null : nameSprite(r.name, CAST[r.char].color);
  if (label) root.add(label);
  return { root, model, shield, ice, flames, sparks, label };
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export class KartView {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(68, 1, 0.5, 2000);
  private racers: RacerView[] = [];
  private boxes: THREE.Mesh[] = [];
  private bursts: { mesh: THREE.Mesh; life: number }[] = [];
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private t = 0;
  private followId: number;

  constructor(
    private container: HTMLElement,
    race: Race,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";

    buildWorld(this.scene, race.track);

    const boxTex = canvasTexture(
      128,
      128,
      (c) => {
        const g = c.createLinearGradient(0, 0, 128, 128);
        g.addColorStop(0, "#5fe3ff");
        g.addColorStop(0.5, "#b28dff");
        g.addColorStop(1, "#ffb347");
        c.fillStyle = g;
        c.fillRect(0, 0, 128, 128);
        c.fillStyle = "rgba(255,255,255,0.35)";
        c.fillRect(8, 8, 112, 112);
        c.fillStyle = "#ffffff";
        c.font = "bold 96px sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("?", 64, 70);
      },
      false,
    );
    const boxMat = new THREE.MeshStandardMaterial({
      map: boxTex,
      transparent: true,
      opacity: 0.9,
      emissive: "#ffffff",
      emissiveIntensity: 0.15,
    });
    const boxGeo = new THREE.BoxGeometry(1.7, 1.7, 1.7);
    for (const b of race.boxes) {
      const m = new THREE.Mesh(boxGeo, boxMat);
      m.position.set(b.x, 1.4, b.z);
      this.scene.add(m);
      this.boxes.push(m);
    }

    for (const r of race.racers) {
      const v = makeRacerView(r);
      this.scene.add(v.root);
      this.racers.push(v);
    }
    const player = race.racers.find((r) => r.isPlayer) ?? race.racers[0];
    this.followId = player.id;
    this.snapCamera(player);
    this.resize();
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / Math.max(1, h);
    // a wider view on tall phone screens
    this.camera.fov = this.camera.aspect < 1 ? 82 : 68;
    this.camera.updateProjectionMatrix();
  }

  private chaseTarget(r: Racer) {
    const fx = Math.cos(r.heading);
    const fz = Math.sin(r.heading);
    const back = 8.5 + Math.min(r.speed, 46) * 0.03;
    return {
      pos: new THREE.Vector3(r.x - fx * back, 3.8, r.z - fz * back),
      look: new THREE.Vector3(r.x + fx * 6, 1.4, r.z + fz * 6),
    };
  }

  private snapCamera(r: Racer) {
    const t = this.chaseTarget(r);
    this.camPos.copy(t.pos);
    this.camLook.copy(t.look);
  }

  private burst(x: number, z: number, color: string) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.18, 8, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    m.position.set(x, 1.5, z);
    m.rotation.x = Math.PI / 2;
    this.scene.add(m);
    this.bursts.push({ mesh: m, life: 0.6 });
  }

  /** React to engine events with one-off visual effects. */
  handleEvents(race: Race, events: RaceEvent[]) {
    for (const e of events) {
      if (e.type === "swap") {
        const a = race.racers[e.racer];
        const b = race.racers[e.target];
        this.burst(a.x, a.z, "#b28dff");
        this.burst(b.x, b.z, "#b28dff");
        if (e.racer === this.followId || e.target === this.followId) this.snapCamera(race.racers[this.followId]);
      } else if (e.type === "freeze") {
        const t = race.racers[e.target];
        this.burst(t.x, t.z, "#d8f6ff");
      } else if (e.type === "blocked") {
        const t = race.racers[e.target];
        this.burst(t.x, t.z, "#5fe3ff");
      } else if (e.type === "boost") {
        const r = race.racers[e.racer];
        this.burst(r.x, r.z, "#ffb347");
      }
    }
  }

  update(race: Race, dt: number) {
    this.t += dt;
    const t = this.t;

    race.racers.forEach((r, i) => {
      const v = this.racers[i];
      v.root.position.set(r.x, 0, r.z);
      v.root.rotation.y = -r.heading;
      // lean into turns, extra when drifting
      v.model.rotation.x = r.steerVis * (r.drifting ? 0.18 : 0.08);
      v.model.rotation.y = r.drifting ? -r.steerVis * 0.35 : 0;
      v.model.position.y = Math.sin(t * 14 + i) * 0.03 * Math.min(1, r.speed / 10);
      for (const w of v.model.userData.wheels as THREE.Object3D[]) w.rotation.z -= (r.speed * dt) / 0.45;
      (v.model.userData.anim as (t: number) => void)?.(t + i);

      v.shield.visible = r.shieldT > 0;
      if (v.shield.visible) v.shield.scale.setScalar(1 + Math.sin(t * 6) * 0.04);
      v.ice.visible = r.frozenT > 0;
      const boosting = r.boostT > 0;
      v.flames.forEach((f, k) => {
        f.visible = boosting;
        if (boosting) f.scale.set(1, 0.8 + Math.abs(Math.sin(t * 30 + k)) * 0.6, 1);
      });
      const sparkColor = r.driftT > 1.8 ? "#ffb347" : "#7fe7ff";
      v.sparks.forEach((s, k) => {
        s.visible = r.drifting && r.driftT > 0.3;
        if (s.visible) {
          (s.material as THREE.MeshBasicMaterial).color.set(sparkColor);
          s.position.y = 0.2 + Math.abs(Math.sin(t * 40 + k * 2)) * 0.5;
          s.rotation.set(t * 20 + k, t * 13, 0);
        }
      });
    });

    race.boxes.forEach((b, i) => {
      const m = this.boxes[i];
      m.visible = b.respawn <= 0;
      m.rotation.set(t * 0.9 + i, t * 1.3 + i, 0);
      m.position.y = 1.4 + Math.sin(t * 2.5 + i) * 0.2;
    });

    for (const b of this.bursts) {
      b.life -= dt;
      const k = 1 - b.life / 0.6;
      b.mesh.scale.setScalar(1 + k * 4);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - k));
    }
    this.bursts = this.bursts.filter((b) => {
      if (b.life > 0) return true;
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      return false;
    });

    // chase camera: smooth follow, wider FOV when boosting
    const me = race.racers[this.followId];
    const target = this.chaseTarget(me);
    const k = 1 - Math.pow(0.0015, dt);
    this.camPos.lerp(target.pos, k);
    this.camLook.lerp(target.look, Math.min(1, k * 1.6));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    const baseFov = this.camera.aspect < 1 ? 82 : 68;
    const wantFov = baseFov + (me.boostT > 0 ? 10 : 0);
    if (Math.abs(this.camera.fov - wantFov) > 0.05) {
      this.camera.fov += (wantFov - this.camera.fov) * Math.min(1, dt * 5);
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        (mat as THREE.MeshStandardMaterial).map?.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
