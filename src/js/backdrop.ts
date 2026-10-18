const canvas = document.getElementById("backdrop") as HTMLCanvasElement | null;
const ctx = canvas?.getContext("2d", { alpha: false });

const SCALE = 3;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const STAR_COLORS = ["#ffffff", "#dccbff", "#5ef2ff", "#ffb38a", "#ff9ce9"];
const SUN_COLORS = ["#ffe7a0", "#ffd36e", "#ffb38a", "#ff8fb1", "#ff6fc8", "#ff4fd8", "#d63cf0"];

const NIGHT_STAR_COLORS = ["#ffffff", "#e8eeff", "#cfdcff", "#b9a8ff", "#9fe8ff"];
const MAGIC = "#7ab8ff";
const SPARKLE_LIFE = 1.5;
const SILHOUETTE = "#03051a";

interface Star {
  x: number;
  y: number;
  phase: number;
  speed: number;
  color: string;
  big: boolean;
}

interface Mote {
  x: number;
  y: number;
  speed: number;
  life: number;
}

interface Sparkle {
  x: number;
  y: number;
  life: number;
}

interface ManeStar {
  band: number;
  x: number;
  off: number;
  phase: number;
  speed: number;
  color: string;
}

interface Scene {
  frameMs: number;
  horizon: number;
  starColors: string[];
  starDensity: number;
  twinkleSpeed: [number, number];
  twinkleAlpha: [number, number];
  firstShooting: number;
  shootingEvery: [number, number];
  shootingDuration: number;
  shootingColors: [string, string];
  magicChance: number;
  setup(): void;
  regenerate(): void;
  render(t: number, dt: number): void;
}

let w = 0;
let h = 0;
let horizon = 0;
let stars: Star[] = [];
const sparkles: Sparkle[] = [];
let shooting = { x: 0, y: 0, t: -1, next: 4, magic: false };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function drawStars(t: number) {
  if (!ctx) return;
  const [lo, hi] = scene.twinkleAlpha;
  for (const s of stars) {
    const tw = Math.pow(0.5 + 0.5 * Math.sin(t * s.speed + s.phase), 3);
    ctx.globalAlpha = lo + (hi - lo) * tw;
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, s.y, 1, 1);
    if (s.big && tw > 0.6) {
      ctx.globalAlpha = (tw - 0.6) * 1.5;
      ctx.fillRect(s.x - 1, s.y, 1, 1);
      ctx.fillRect(s.x + 1, s.y, 1, 1);
      ctx.fillRect(s.x, s.y - 1, 1, 1);
      ctx.fillRect(s.x, s.y + 1, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

function drawShootingStar(dt: number) {
  if (!ctx) return;
  if (shooting.t < 0) {
    shooting.next -= dt;
    if (shooting.next <= 0) {
      shooting = {
        x: rand(w * 0.2, w),
        y: rand(0, horizon * 0.4),
        t: 0,
        next: rand(...scene.shootingEvery),
        magic: Math.random() < scene.magicChance,
      };
    }
    return;
  }
  shooting.t += dt;
  const len = 14;
  const p = shooting.t / scene.shootingDuration;
  if (p >= 1) {
    shooting.t = -1;
    return;
  }
  const hx = shooting.x - p * w * 0.35;
  const hy = shooting.y + p * w * 0.12;
  const [head, tail] = shooting.magic ? ["#ffffff", MAGIC] : scene.shootingColors;
  for (let i = 0; i < len; i++) {
    ctx.globalAlpha = (1 - i / len) * Math.sin(p * Math.PI);
    ctx.fillStyle = i < 2 ? head : tail;
    ctx.fillRect(Math.round(hx + i * 2.9), Math.round(hy - i), 1, 1);
  }
  ctx.globalAlpha = 1;
  if (shooting.magic && dt > 0) {
    sparkles.push({ x: hx + rand(1, 10), y: hy + rand(-2, 2), life: 0 });
  }
}

function drawSparkles(dt: number) {
  if (!ctx) return;
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.life += dt;
    s.y += dt * 3;
    if (s.life >= SPARKLE_LIFE) {
      sparkles.splice(i, 1);
      continue;
    }
    const fade = 1 - s.life / SPARKLE_LIFE;
    ctx.globalAlpha = fade * (0.5 + 0.5 * Math.sin(s.life * 18 + s.x));
    ctx.fillStyle = i % 3 === 0 ? "#ffffff" : MAGIC;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

// Synthwave: sun, grid and rising motes.

let motes: Mote[] = [];
let sky: CanvasGradient | undefined;
let ground: CanvasGradient | undefined;
let haze: CanvasGradient | undefined;
let glow: CanvasGradient | undefined;

function sunRadius() {
  return Math.round(Math.min(w * 0.14, horizon * 0.36));
}

function newMote(anywhere: boolean): Mote {
  return {
    x: Math.floor(rand(w * 0.2, w * 0.8)),
    y: anywhere ? rand(horizon * 0.3, horizon) : horizon,
    speed: rand(2, 7),
    life: 0,
  };
}

function drawSun(t: number) {
  if (!ctx || !glow) return;
  const r = sunRadius();
  const cx = Math.round(w / 2);
  const cy = horizon - Math.round(r * 0.08);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, horizon);

  const bandShift = (t * 3) % 6;
  for (let y = -r; y <= 0; y++) {
    const rowY = cy + y;
    if (rowY >= horizon) continue;
    const depth = (y + r) / r;
    if (depth > 0.45) {
      const local = (rowY - (cy - r * 0.55) + bandShift) % 6;
      const gap = 1 + Math.floor((depth - 0.45) * 6);
      if (local < gap) continue;
    }
    const half = Math.round(Math.sqrt(r * r - y * y));
    const idx = Math.min(SUN_COLORS.length - 1, Math.floor(depth * SUN_COLORS.length));
    ctx.fillStyle = SUN_COLORS[idx];
    ctx.fillRect(cx - half, rowY, half * 2, 1);
  }
}

function drawGrid(t: number) {
  if (!ctx || !ground || !haze) return;
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);

  const gh = h - horizon;
  const cx = w / 2;
  const phase = (t * 0.6) % 1;

  ctx.fillStyle = "#ff4fd8";
  for (let n = 1; n < 40; n++) {
    const depth = n - phase;
    if (depth <= 0.05) continue;
    const y = Math.round(horizon + (gh * 0.9) / depth);
    if (y >= h || y <= horizon) continue;
    ctx.globalAlpha = Math.min(1, ((y - horizon) / gh) * 2.2) * 0.85;
    ctx.fillRect(0, y, w, 1);
  }

  const spacing = w * 0.09;
  const lines = Math.ceil(w / spacing) * 2;
  for (let y = horizon + 1; y < h; y++) {
    const k = (y - horizon) / gh;
    ctx.globalAlpha = Math.min(1, k * 2) * 0.75;
    for (let i = -lines; i <= lines; i++) {
      const x = Math.round(cx + i * spacing * k * 2.4);
      if (x < 0 || x >= w) continue;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - 2, w, gh * 0.35 + 2);
  ctx.fillStyle = "#ffb3e6";
  ctx.fillRect(0, horizon, w, 1);
}

function drawMotes(dt: number) {
  if (!ctx) return;
  ctx.fillStyle = "#5ef2ff";
  for (let i = 0; i < motes.length; i++) {
    const m = motes[i];
    m.y -= m.speed * dt;
    m.life += dt;
    if (m.y < horizon * 0.25) motes[i] = newMote(false);
    const a = Math.min(1, m.life) * Math.max(0, (m.y - horizon * 0.25) / (horizon * 0.75));
    ctx.globalAlpha = a * 0.6;
    ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

const SYNTHWAVE: Scene = {
  frameMs: 1000 / 30,
  horizon: 0.82,
  starColors: STAR_COLORS,
  starDensity: 260,
  twinkleSpeed: [0.4, 2.2],
  twinkleAlpha: [0.15, 1],
  firstShooting: 4,
  shootingEvery: [6, 14],
  shootingDuration: 0.9,
  shootingColors: ["#ffffff", "#ffd36e"],
  magicChance: 0,

  setup() {
    if (!ctx) return;
    sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#0b0016");
    sky.addColorStop(0.55, "#1c0633");
    sky.addColorStop(0.85, "#3d0d55");
    sky.addColorStop(1, "#6a1667");

    ground = ctx.createLinearGradient(0, horizon, 0, h);
    ground.addColorStop(0, "#2a0840");
    ground.addColorStop(1, "#0b0016");

    haze = ctx.createLinearGradient(0, horizon - 2, 0, horizon + (h - horizon) * 0.35);
    haze.addColorStop(0, "rgba(255, 120, 200, 0.55)");
    haze.addColorStop(1, "rgba(42, 8, 64, 0)");

    const r = sunRadius();
    glow = ctx.createRadialGradient(w / 2, horizon, r * 0.6, w / 2, horizon, r * 2.6);
    glow.addColorStop(0, "rgba(255, 110, 200, 0.35)");
    glow.addColorStop(1, "rgba(255, 110, 200, 0)");
  },

  regenerate() {
    motes = Array.from({ length: Math.round(w / 18) }, () => newMote(true));
  },

  render(t, dt) {
    if (!ctx || !sky) return;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);
    drawStars(t);
    drawShootingStar(dt);
    drawSun(t);
    drawMotes(dt);
    drawGrid(t);
  },
};

// Night: Princess Luna's sky. Her mane streams from the moon across the
// stars, an aurora hangs low over the horizon, a pegasus passes by now and
// then, and Canterlot keeps watch from its mountainside.

// Luna's mane palette (periwinkle, cornflower, pale sky and a violet sheen),
// pulled darker and softer so it sits inside the night rather than on it.
const MANE_STRANDS = [
  { dy: -0.35, slope: 0.16, amp: 0.05, freq: 0.012, speed: 0.03, phase: 0, width: 0.1, color: "#4a64c8", alpha: 0.08 },
  { dy: 0.15, slope: 0.3, amp: 0.045, freq: 0.017, speed: -0.022, phase: 2, width: 0.065, color: "#8fc0f2", alpha: 0.055 },
  { dy: 0.5, slope: 0.07, amp: 0.035, freq: 0.009, speed: 0.017, phase: 4, width: 0.055, color: "#9a86e0", alpha: 0.05 },
];

// The Mare in the Moon's crater pattern, in moon-radius units from the
// centre: [x, y, radiusX, radiusY, rotation?]. Seas are filled ellipses;
// bowls are an ellipse with an offset one carved out (rings and arcs).
const MARE_SEAS: number[][] = [
  [0.30, -0.65, 0.14, 0.10], [0.37, -0.79, 0.06, 0.05], [0.50, -0.76, 0.05, 0.03], [0.54, -0.60, 0.09, 0.10],
  [0.73, -0.50, 0.08, 0.11, -0.35], [0.14, -0.54, 0.07, 0.07], [-0.02, -0.48, 0.06, 0.08], [-0.15, -0.46, 0.07, 0.07],
  [-0.28, -0.48, 0.04, 0.04], [-0.40, -0.50, 0.02, 0.02], [-0.48, -0.51, 0.03, 0.03], [-0.58, -0.52, 0.03, 0.02],
  [-0.17, -0.64, 0.03, 0.03], [0.39, -0.42, 0.10, 0.10], [0.54, -0.38, 0.12, 0.14], [0.70, -0.28, 0.11, 0.14],
  [0.87, -0.23, 0.04, 0.06], [0.35, -0.32, 0.07, 0.09, 0.26], [-0.05, -0.28, 0.05, 0.07], [-0.04, -0.16, 0.05, 0.04],
  [0.25, -0.03, 0.10, 0.12, 0.6], [-0.06, -0.01, 0.07, 0.10], [0.07, 0.11, 0.07, 0.06], [0.56, 0.01, 0.12, 0.13],
  [0.73, -0.06, 0.09, 0.14], [0.90, -0.02, 0.06, 0.08], [0.75, 0.19, 0.14, 0.15], [0.47, 0.17, 0.07, 0.07],
  [0.64, 0.38, 0.14, 0.14], [0.44, 0.43, 0.10, 0.15], [0.51, 0.60, 0.10, 0.10], [0.68, 0.61, 0.05, 0.05, 0.5],
  [0.31, 0.72, 0.10, 0.11], [0.13, 0.78, 0.09, 0.11, 0.5], [0.32, 0.58, 0.04, 0.06], [0.47, 0.78, 0.03, 0.04],
  [0.38, -0.18, 0.04, 0.04], [0.52, -0.21, 0.06, 0.05], [-0.14, 0.15, 0.03, 0.03], [0.44, -0.54, 0.08, 0.07],
];
const MARE_BOWLS = [
  { outer: [0.034, -0.908, 0.176, 0.058], inner: [0.024, -0.939, 0.166, 0.044], angle: -0.07 },
  { outer: [-0.017, -0.647, 0.105, 0.061], inner: [-0.014, -0.658, 0.071, 0.037], angle: 0 },
  { outer: [0.153, -0.281, 0.136, 0.176], inner: [0.156, -0.295, 0.102, 0.146], angle: 0.35 },
  { outer: [-0.864, 0.024, 0.085, 0.095], inner: [-0.875, 0.041, 0.051, 0.047], angle: -0.52 },
  { outer: [-0.675, 0.576, 0.136, 0.136], inner: [-0.675, 0.576, 0.115, 0.115], angle: 0 },
  { outer: [-0.061, 0.244, 0.081, 0.058], inner: [-0.041, 0.224, 0.061, 0.041], angle: 0 },
];

// A Pony Town-style pegasus (23x16, facing right) that crosses the sky now
// and then: a round MLP head, a mane over the crown with a forelock curling
// down the face, and stubby legs. C coat, S shaded coat, M mane, N mane shadow,
// L eye highlight, E eye. The tail flutters between two shapes, the wings are
// row spans (with a darker far wing behind the body), and outlines are added
// around the whole silhouette when each frame is drawn.
const PEGASUS_BODY = [
  ".............CC........",
  "..........MMMCCMMM.....",
  ".........MMMMMMMMMMM...",
  ".........MMNMMMNNMMMM..",
  "........MMNMMNCCCCNMM..",
  "........MMNMMNCCCCCNM..",
  "........MMNMMNCCCLECN..",
  ".........MMNMNCCCEECCC.",
  ".........MMNMNCCCCCCCC.",
  "........MMNMNSSSSSSSS..",
  ".....CCCMMMMMCC........",
  "....CCCCCMMMCCC........",
  "....CCCCCCCCCCC........",
  ".....SSSSSSSSS.........",
  ".....SS.....SSC........",
  "....SS.......CC........",
];
const TAIL_ROW = 10;
const PEGASUS_TAILS = [
  ["MMM.", "MNMM", ".MNM", "..MM", "...M"],
  ["MMNM", "MNMM", ".MNM", "..M.", "...."],
];
// Wing poses as {row: [from, to]}: up, raised, level, down.
const PEGASUS_WINGS: Record<number, [number, number]>[] = [
  { 2: [3, 3], 3: [3, 5], 4: [4, 6], 5: [5, 7], 6: [5, 8], 7: [6, 9], 8: [7, 10], 9: [8, 10], 10: [9, 10] },
  { 6: [2, 3], 7: [2, 6], 8: [3, 8], 9: [6, 10], 10: [8, 10] },
  { 9: [1, 9], 10: [2, 10] },
  { 11: [7, 10], 12: [6, 9], 13: [5, 8], 14: [5, 7], 15: [6, 6] },
];
const WINGBEAT = [0, 1, 2, 3, 2, 1];

// Canterlot spires: offset from the castle centre, half-width, height as a
// fraction of the skyline unit, and which row (if any) has a lit window.
// The tallest one holds Luna's balcony.
const SPIRES = [
  { dx: -16, hw: 1, hgt: 0.13, lit: 0.6 },
  { dx: -10, hw: 1.5, hgt: 0.19, lit: 0.35 },
  { dx: -3, hw: 2, hgt: 0.24, lit: 0 },
  { dx: 5, hw: 2.5, hgt: 0.31, lit: 0 },
  { dx: 12, hw: 1.5, hgt: 0.2, lit: 0.5 },
  { dx: 18, hw: 1, hgt: 0.15, lit: 0 },
  { dx: 23, hw: 1, hgt: 0.11, lit: 0.7 },
];
const BALCONY = 3;

let nightSky: CanvasGradient | undefined;
let windowGlow: CanvasGradient | undefined;
let windowPos = { x: 0, y: 0 };
let moon = { x: 0, y: 0, r: 0 };
let maneStars: ManeStar[] = [];
let pegasus = {
  t: -1,
  next: rand(20, 40),
  x: 0,
  y: 0,
  dir: 1,
  speed: 0,
  gliding: false,
  phaseLeft: 0,
  beat: 0,
  colors: {} as Record<string, string>,
};
const celestial = document.createElement("canvas");
const land = document.createElement("canvas");
const auroraStrip = document.createElement("canvas");

// One column of aurora light: bright teal at its foot, through blue, to a
// violet that fades into the sky. Stretched per column each frame.
auroraStrip.width = 1;
auroraStrip.height = 64;
{
  const c = auroraStrip.getContext("2d");
  if (c) {
    const g = c.createLinearGradient(0, 64, 0, 0);
    g.addColorStop(0, "rgba(110, 230, 215, 0)");
    g.addColorStop(0.2, "rgba(110, 230, 215, 0.85)");
    g.addColorStop(0.25, "rgba(110, 195, 255, 0.65)");
    g.addColorStop(0.6, "rgba(125, 140, 255, 0.3)");
    g.addColorStop(1, "rgba(165, 120, 255, 0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 1, 64);
  }
}

// A mane strand at column x: centre line, half-width, and how far along
// the strand we are (0 at the moon, 1 at the left edge).
function strandAt(b: typeof MANE_STRANDS[number], x: number, t: number) {
  const d = Math.max(0, (moon.x - x) / moon.x);
  const wave = Math.sin(x * b.freq + t * b.speed + b.phase) +
    0.5 * Math.sin(x * b.freq * 2.3 - t * b.speed * 1.6 + b.phase * 1.7);
  const y = moon.y + moon.r * b.dy + h * b.slope * d + h * b.amp * Math.min(1, d * 3) * wave;
  const half = Math.max(1, ((h * b.width) / 2) * (0.2 + 0.8 * Math.sqrt(d)));
  return { y, half, d };
}

function buildCelestial() {
  celestial.width = w;
  celestial.height = h;
  const c = celestial.getContext("2d");
  if (!c) return;

  const { x: mx, y: my, r } = moon;

  // A soft breath of moonlight, no harder edge than the sky itself.
  const halo = c.createRadialGradient(mx, my, r * 0.6, mx, my, r * 4);
  halo.addColorStop(0, "rgba(140, 165, 255, 0.12)");
  halo.addColorStop(0.4, "rgba(140, 165, 255, 0.04)");
  halo.addColorStop(1, "rgba(140, 165, 255, 0)");
  c.fillStyle = halo;
  c.fillRect(0, 0, w, h);

  // The Mare in the Moon: a full moon with her silhouette pressed into the
  // craters, the dotted line of her horn trailing off to the left. Each pixel
  // is sampled 3x3; the ringed craters' thin rims get a lower threshold than
  // the seas so they still show at this size instead of dissolving.
  const inEllipse = (nx: number, ny: number, e: number[], angle = e[4] ?? 0) => {
    const dx = nx - e[0];
    const dy = ny - e[1];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return Math.hypot((dx * cos + dy * sin) / e[2], (dy * cos - dx * sin) / e[3]) <= 1;
  };
  const inSea = (nx: number, ny: number) => MARE_SEAS.some((e) => inEllipse(nx, ny, e));
  const inBowl = (nx: number, ny: number) =>
    MARE_BOWLS.some((b) => inEllipse(nx, ny, b.outer, b.angle) && !inEllipse(nx, ny, b.inner, b.angle));
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x + 0.5, y + 0.5);
      if (d > r) continue;
      let sea = 0;
      let bowl = 0;
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const nx = (x + (sx + 0.5) / 3) / r;
          const ny = (y + (sy + 0.5) / 3) / r;
          if (inSea(nx, ny)) sea++;
          else if (inBowl(nx, ny)) bowl++;
        }
      }
      const dark = sea >= 5 || bowl >= 3 || sea + bowl >= 5;
      const soft = sea >= 2 || bowl >= 1;
      c.fillStyle = dark ? "#bebbdc" : soft ? "#d1cee9" : d > r - 1 ? "#d3d5f3" : "#e6e3f9";
      c.fillRect(mx + x, my + y, 1, 1);
    }
  }
}

function buildLand() {
  land.width = w;
  land.height = h;
  const c = land.getContext("2d");
  if (!c || !ctx) return;

  const u = Math.min(h, w * 0.75);
  const k = Math.min(1, Math.max(0.55, w / 420));
  const castleX = Math.round(w * 0.06);
  const spread = Math.max(20, w * 0.09);
  const bump = (x: number, cx: number, s: number) => Math.exp(-(((x - cx) / s) ** 2));
  const peakX = castleX + spread * 0.5;
  const peak = (x: number) => {
    const d = x - peakX;
    const p = Math.max(0, 1 - Math.abs(d) / (d < 0 ? spread * 0.8 : spread * 1.6));
    return Math.pow(p, 1.3) + 0.06 * p * (Math.sin(x * 0.37) + Math.sin(x * 0.83 + 1));
  };

  // Far range: hazy blue mountains, with Canterlot's peak rising behind the castle.
  const far = Array.from({ length: w }, (_, x) =>
    u * 0.09 + u * 0.03 * Math.sin(x * 0.015 + 2) + u * 0.015 * Math.sin(x * 0.041) +
    u * 0.006 * Math.sin(x * 0.29) + u * 0.22 * peak(x));
  c.fillStyle = "#0b1240";
  for (let x = 0; x < w; x++) {
    const top = Math.round(far[x]);
    c.fillRect(x, h - top, 1, top);
  }
  c.fillStyle = "rgba(120, 150, 255, 0.22)";
  for (let x = 0; x < w; x++) c.fillRect(x, h - Math.round(far[x]), 1, 1);

  // Near hills, lifted into a shoulder of rock the castle stands on.
  const tops = Array.from({ length: w }, (_, x) =>
    u * 0.05 + u * 0.02 * Math.sin(x * 0.021 + 1) + u * 0.012 * Math.sin(x * 0.057 + 3) +
    u * 0.035 * bump(x, castleX, spread * 0.6));

  const spires = SPIRES.map((s) => {
    const hw = Math.max(1, Math.round(s.hw * k));
    return { cx: castleX + Math.round(s.dx * k), hw, body: u * s.hgt, roof: (hw + 1) * 3, lit: s.lit };
  });
  const wallFrom = spires[0].cx;
  const wallTo = spires[spires.length - 1].cx;
  const wallTop = u * 0.115;
  for (let x = 0; x < w; x++) {
    if (x >= wallFrom && x <= wallTo) {
      tops[x] = Math.max(tops[x], wallTop + (x % 3 === 0 ? 1 : 0));
    }
    for (const s of spires) {
      const d = Math.abs(x - s.cx);
      if (d > s.hw) continue;
      tops[x] = Math.max(tops[x], s.body + s.roof * (1 - d / (s.hw + 1)));
    }
  }

  c.fillStyle = SILHOUETTE;
  for (let x = 0; x < w; x++) {
    const top = Math.round(tops[x]);
    c.fillRect(x, h - top, 1, top);
  }
  c.fillStyle = "rgba(90, 120, 230, 0.45)";
  for (let x = 0; x < w; x++) c.fillRect(x, h - Math.round(tops[x]), 1, 1);

  // Needle finials on every spire but the balcony, which flies a pennant.
  c.fillStyle = SILHOUETTE;
  spires.forEach((s, i) => {
    if (i === BALCONY) return;
    c.fillRect(s.cx, Math.round(h - (s.body + s.roof)) - 2, 1, 2);
  });

  // A few sleepy windows still lit, and a scatter along the wall.
  for (const s of spires) {
    if (!s.lit) continue;
    c.fillStyle = "rgba(255, 205, 150, 0.55)";
    c.fillRect(s.cx, Math.round(h - s.body * s.lit), 1, 1);
  }
  c.fillStyle = "rgba(255, 205, 150, 0.35)";
  for (let x = wallFrom + 2; x < wallTo - 1; x += 4) {
    if ((x * 7) % 3 === 0) continue;
    c.fillRect(x, Math.round(h - wallTop * 0.55), 1, 1);
  }

  // Luna's balcony: a lit window, a ledge, and a crescent pennant.
  const b = spires[BALCONY];
  const bodyTop = Math.round(h - b.body);
  const ww = b.hw >= 2 ? 2 : 1;
  const wx = b.cx - (ww === 2 ? 1 : 0);
  const wy = bodyTop + 3;
  c.fillStyle = SILHOUETTE;
  c.fillRect(b.cx - b.hw - 1, wy + 3, b.hw * 2 + 3, 1);
  c.fillStyle = "#ffd9a0";
  c.fillRect(wx, wy, ww, 3);

  const tip = Math.round(h - (b.body + b.roof));
  c.fillStyle = SILHOUETTE;
  c.fillRect(b.cx, tip - 6, 1, 6);
  c.fillStyle = "#3a4bb0";
  c.fillRect(b.cx + 1, tip - 6, 4, 1);
  c.fillRect(b.cx + 1, tip - 5, 3, 1);
  c.fillRect(b.cx + 1, tip - 4, 2, 1);
  c.fillStyle = "#eef2ff";
  c.fillRect(b.cx + 2, tip - 6, 1, 1);
  c.fillRect(b.cx + 1, tip - 5, 1, 1);

  windowPos = { x: wx + ww / 2, y: wy + 1.5 };
  windowGlow = ctx.createRadialGradient(windowPos.x, windowPos.y, 0, windowPos.x, windowPos.y, 10);
  windowGlow.addColorStop(0, "rgba(255, 205, 150, 0.35)");
  windowGlow.addColorStop(1, "rgba(255, 205, 150, 0)");
}

function drawAurora(t: number) {
  if (!ctx) return;
  const base = h * 0.74;
  const maxH = h * 0.32;
  for (let x = 0; x < w; x++) {
    const patch = (0.5 + 0.5 * Math.sin(x * 0.009 + t * 0.025)) *
      (0.5 + 0.5 * Math.sin(x * 0.004 - t * 0.013 + 1.3));
    const rays = 0.65 + 0.35 * Math.sin(x * 0.21 + t * 0.12) * Math.sin(x * 0.067 - t * 0.07);
    const k = patch * rays;
    if (k < 0.03) continue;
    const foot = base + h * 0.05 * Math.sin(x * 0.011 + t * 0.02) + h * 0.02 * Math.sin(x * 0.031 - t * 0.03);
    const tall = maxH * (0.45 + 0.55 * patch) * (0.75 + 0.25 * rays);
    ctx.globalAlpha = k * 0.2;
    ctx.drawImage(auroraStrip, 0, 0, 1, 64, x, foot - tall, 1, tall);
  }
  ctx.globalAlpha = 1;
}

function drawMane(t: number) {
  if (!ctx) return;
  for (const b of MANE_STRANDS) {
    ctx.fillStyle = b.color;
    for (let x = 0; x < moon.x; x++) {
      const { y, half, d } = strandAt(b, x, t);
      ctx.globalAlpha = b.alpha * Math.min(1, d * 10) * (1 - 0.55 * d);
      ctx.fillRect(x, Math.round(y - half), 1, Math.round(half * 2));
      ctx.fillRect(x, Math.round(y - half * 0.6), 1, Math.round(half * 1.2));
      ctx.fillRect(x, Math.round(y - half * 0.25), 1, Math.max(1, Math.round(half * 0.5)));
    }
  }
  // The mane's stars stay put; the strand drifts over them, lighting the
  // ones near its centre and letting the rest fade back into the sky.
  for (const s of maneStars) {
    const b = MANE_STRANDS[s.band];
    const rest = strandAt(b, s.x, 0);
    const now = strandAt(b, s.x, t);
    const y = rest.y + s.off * rest.half * 1.4;
    const near = Math.max(0, 1 - Math.abs(y - now.y) / (now.half * 1.2));
    if (near <= 0) continue;
    const tw = Math.pow(0.5 + 0.5 * Math.sin(t * s.speed + s.phase), 2);
    ctx.globalAlpha = (0.2 + 0.6 * tw) * near * Math.min(1, now.d * 6);
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

// Night-shaded pony colours: any hue, but muted and dark so it reads as a
// pony passing under the moon rather than a bright sprite. Outlines are a
// deeper shade of each part, as in Pony Town.
function pegasusColors() {
  const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${Math.max(3, l)}%)`;
  const ch = rand(0, 360);
  const cs = rand(15, 35);
  const cl = rand(18, 26);
  const mh = rand(0, 360);
  const ms = rand(35, 55);
  const ml = rand(24, 32);
  return {
    C: hsl(ch, cs, cl), Cr: hsl(ch, cs, cl + 7), S: hsl(ch, cs, cl - 8),
    W: hsl(ch, cs, cl + 4), Wr: hsl(ch, cs, cl + 11), f: hsl(ch, cs, cl - 6),
    M: hsl(mh, ms, ml), Mr: hsl(mh, ms, ml + 7), N: hsl(mh, ms, ml - 9),
    L: hsl(220, 20, cl + 35), E: "#07091a",
    Oc: hsl(ch, cs + 10, cl - 14), Om: hsl(mh, ms + 10, ml - 16),
  };
}

function drawPegasus(dt: number) {
  if (!ctx) return;
  const top = h * 0.42;
  const bottom = h * 0.62;
  if (pegasus.t < 0) {
    pegasus.next -= dt;
    if (pegasus.next <= 0 && dt > 0) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      pegasus = {
        t: 0,
        next: 0,
        x: dir > 0 ? -26 : w + 2,
        y: rand(top, bottom),
        dir,
        speed: w / rand(16, 22),
        gliding: false,
        phaseLeft: rand(1.8, 3),
        beat: 0,
        colors: pegasusColors(),
      };
    }
    return;
  }
  const p = pegasus;
  p.t += dt;
  p.x += p.dir * p.speed * dt;
  if (p.x < -28 || p.x > w + 4) {
    pegasus = { ...p, t: -1, next: rand(60, 150) };
    return;
  }

  // Bursts of wingbeats that climb, then glides that sink gently with the
  // wings held raised in a shallow V.
  p.phaseLeft -= dt;
  if (p.phaseLeft <= 0) {
    p.gliding = !p.gliding;
    p.phaseLeft = p.gliding ? rand(1.2, 2.5) : rand(1.8, 3);
  }
  let frame = 1;
  let bob = 0;
  if (p.gliding) {
    p.y += 1.8 * dt;
  } else {
    p.beat += dt * 1.6;
    frame = WINGBEAT[Math.floor(p.beat * 6) % 6];
    bob = frame === 3 ? -1 : frame === 0 ? 1 : 0;
    p.y -= 2.5 * dt;
  }
  p.y = Math.min(bottom, Math.max(top, p.y));

  // Compose this frame: far wing, body and tail, then the near wing.
  const key = (x: number, y: number) => (y + 2) * 40 + x + 2;
  const fills = new Map<number, string>();
  const wing = PEGASUS_WINGS[frame];
  for (const [row, [a, b]] of Object.entries(wing)) {
    for (let x = a + 2; x <= b + 2; x++) fills.set(key(x, Number(row) - 1), "f");
  }
  const tail = PEGASUS_TAILS[Math.floor(p.t * 4) % 2];
  PEGASUS_BODY.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const k = row[x] !== "." ? row[x] : tail[y - TAIL_ROW]?.[x] ?? ".";
      if (k !== ".") fills.set(key(x, y), k);
    }
  });
  for (const [row, [a, b]] of Object.entries(wing)) {
    for (let x = a; x <= b; x++) fills.set(key(x, Number(row)), "W");
  }

  const ox = Math.round(p.x);
  const oy = Math.round(p.y) + bob;
  const plot = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + (p.dir > 0 ? x : 22 - x), oy + y, 1, 1);
  };

  // Outline: any empty pixel touching the silhouette, in the mane's deeper
  // shade where it only touches mane, otherwise the coat's.
  for (let y = -2; y < 18; y++) {
    for (let x = -1; x < 25; x++) {
      if (fills.has(key(x, y))) continue;
      const near = [key(x + 1, y), key(x - 1, y), key(x, y + 1), key(x, y - 1)]
        .map((n) => fills.get(n))
        .filter((n): n is string => !!n);
      if (!near.length) continue;
      plot(x, y, p.colors[near.every((n) => n === "M" || n === "N") ? "Om" : "Oc"]);
    }
  }

  // Fills, with moonlight catching the top edge of the coat, mane and wing.
  for (const [k, part] of fills) {
    const x = (k % 40) - 2;
    const y = Math.floor(k / 40) - 2;
    const lit = (part === "C" || part === "M" || part === "W") && !fills.has(key(x, y - 1));
    plot(x, y, p.colors[lit ? part + "r" : part]);
  }
}

function drawWindowGlow(t: number) {
  if (!ctx || !windowGlow) return;
  ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.8);
  ctx.fillStyle = windowGlow;
  ctx.fillRect(windowPos.x - 10, windowPos.y - 10, 20, 20);
  ctx.globalAlpha = 1;
}

const NIGHT: Scene = {
  frameMs: 1000 / 20,
  horizon: 0.92,
  starColors: NIGHT_STAR_COLORS,
  starDensity: 240,
  twinkleSpeed: [0.15, 0.6],
  twinkleAlpha: [0.35, 0.9],
  firstShooting: 10,
  shootingEvery: [18, 40],
  shootingDuration: 1.3,
  shootingColors: ["#ffffff", "#cfe0ff"],
  magicChance: 1 / 3,

  setup() {
    if (!ctx) return;
    nightSky = ctx.createLinearGradient(0, 0, 0, h);
    nightSky.addColorStop(0, "#05081c");
    nightSky.addColorStop(0.45, "#0c1238");
    nightSky.addColorStop(0.8, "#17205a");
    nightSky.addColorStop(1, "#212a6e");

    moon = {
      x: Math.round(w * 0.85),
      y: Math.round(h * 0.17),
      r: Math.max(6, Math.round(Math.min(w * 0.05, h * 0.08))),
    };

    buildCelestial();
    buildLand();
  },

  regenerate() {
    maneStars = MANE_STRANDS.flatMap((_, band) =>
      Array.from({ length: Math.round(w / 5) }, () => ({
        band,
        x: Math.floor(Math.random() * w * 0.85),
        off: Math.random() + Math.random() - 1,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.2, 0.8),
        color: Math.random() < 0.6 ? "#ffffff" : "#cfe6ff",
      }))
    );
  },

  render(t, dt) {
    if (!ctx || !nightSky) return;
    ctx.fillStyle = nightSky;
    ctx.fillRect(0, 0, w, h);
    drawAurora(t);
    drawStars(t);
    drawMane(t);
    ctx.drawImage(celestial, 0, 0);
    drawShootingStar(dt);
    drawPegasus(dt);
    drawSparkles(dt);
    ctx.drawImage(land, 0, 0);
    drawWindowGlow(t);
  },
};

const scene = document.documentElement.dataset.scene === "night" ? NIGHT : SYNTHWAVE;
shooting.next = scene.firstShooting;

function resize() {
  if (!canvas || !ctx) return;
  const nw = Math.ceil(canvas.clientWidth / SCALE);
  const nh = Math.ceil(canvas.clientHeight / SCALE);
  if (nw === w && nh === h) return;
  const regenerate = nw !== w;
  w = canvas.width = nw;
  h = canvas.height = nh;
  horizon = Math.round(h * scene.horizon);

  scene.setup();

  if (regenerate || stars.length === 0) {
    const count = Math.round((w * horizon) / scene.starDensity);
    stars = Array.from({ length: count }, () => ({
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.pow(Math.random(), 1.4) * (horizon - 6)),
      phase: rand(0, Math.PI * 2),
      speed: rand(...scene.twinkleSpeed),
      color: scene.starColors[Math.floor(Math.random() * scene.starColors.length)],
      big: Math.random() < 0.05,
    }));
    scene.regenerate();
  }
}

let last = 0;
let lastFrame = 0;
let raf = 0;

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  if (now - lastFrame < scene.frameMs) return;
  const dt = Math.min(0.1, (now - (last || now)) / 1000);
  last = now;
  lastFrame = now;
  scene.render(now / 1000, dt);
}

function start() {
  cancelAnimationFrame(raf);
  resize();
  if (reducedMotion.matches) {
    scene.render(0, 0);
  } else {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}

if (canvas && ctx) {
  new ResizeObserver(() => {
    resize();
    if (reducedMotion.matches) scene.render(0, 0);
  }).observe(canvas);
  reducedMotion.addEventListener("change", start);
  start();
}
