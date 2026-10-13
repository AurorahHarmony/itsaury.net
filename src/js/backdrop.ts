const canvas = document.getElementById("backdrop") as HTMLCanvasElement | null;
const ctx = canvas?.getContext("2d", { alpha: false });

const SCALE = 3;
const FRAME_MS = 1000 / 30;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const STAR_COLORS = ["#ffffff", "#dccbff", "#5ef2ff", "#ffb38a", "#ff9ce9"];
const SUN_COLORS = ["#ffe7a0", "#ffd36e", "#ffb38a", "#ff8fb1", "#ff6fc8", "#ff4fd8", "#d63cf0"];

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

let w = 0;
let h = 0;
let horizon = 0;
let stars: Star[] = [];
let motes: Mote[] = [];
let sky: CanvasGradient | undefined;
let ground: CanvasGradient | undefined;
let haze: CanvasGradient | undefined;
let glow: CanvasGradient | undefined;
let shooting = { x: 0, y: 0, t: -1, next: 4 };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function resize() {
  if (!canvas || !ctx) return;
  const nw = Math.ceil(canvas.clientWidth / SCALE);
  const nh = Math.ceil(canvas.clientHeight / SCALE);
  if (nw === w && nh === h) return;
  const regenerate = nw !== w;
  w = canvas.width = nw;
  h = canvas.height = nh;
  horizon = Math.round(h * 0.82);

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

  if (regenerate || stars.length === 0) {
    const count = Math.round((w * horizon) / 260);
    stars = Array.from({ length: count }, () => ({
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.pow(Math.random(), 1.4) * (horizon - 6)),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 2.2),
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      big: Math.random() < 0.05,
    }));
    motes = Array.from({ length: Math.round(w / 18) }, () => newMote(true));
  }
}

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

function drawStars(t: number) {
  if (!ctx) return;
  for (const s of stars) {
    const tw = Math.pow(0.5 + 0.5 * Math.sin(t * s.speed + s.phase), 3);
    ctx.globalAlpha = 0.15 + 0.85 * tw;
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
      shooting = { x: rand(w * 0.2, w), y: rand(0, horizon * 0.4), t: 0, next: rand(6, 14) };
    }
    return;
  }
  shooting.t += dt;
  const len = 14;
  const p = shooting.t / 0.9;
  if (p >= 1) {
    shooting.t = -1;
    return;
  }
  const hx = shooting.x - p * w * 0.35;
  const hy = shooting.y + p * w * 0.12;
  for (let i = 0; i < len; i++) {
    ctx.globalAlpha = (1 - i / len) * Math.sin(p * Math.PI);
    ctx.fillStyle = i < 2 ? "#ffffff" : "#ffd36e";
    ctx.fillRect(Math.round(hx + i * 2.9), Math.round(hy - i), 1, 1);
  }
  ctx.globalAlpha = 1;
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

function render(t: number, dt: number) {
  if (!ctx || !sky) return;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);
  drawStars(t);
  drawShootingStar(dt);
  drawSun(t);
  drawMotes(dt);
  drawGrid(t);
}

let last = 0;
let lastFrame = 0;
let raf = 0;

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  if (now - lastFrame < FRAME_MS) return;
  const dt = Math.min(0.1, (now - (last || now)) / 1000);
  last = now;
  lastFrame = now;
  render(now / 1000, dt);
}

function start() {
  cancelAnimationFrame(raf);
  resize();
  if (reducedMotion.matches) {
    render(0, 0);
  } else {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}

if (canvas && ctx) {
  new ResizeObserver(() => {
    resize();
    if (reducedMotion.matches) render(0, 0);
  }).observe(canvas);
  reducedMotion.addEventListener("change", start);
  start();
}
