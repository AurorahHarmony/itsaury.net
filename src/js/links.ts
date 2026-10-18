const card = document.querySelector<HTMLElement>(".holo-card");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = matchMedia("(pointer: coarse)");
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

let lastInput = -Infinity;
// True while a mouse/pen is over the page: it keeps the card under pointer
// control however long it sits still, and only leaving hands off to the drift
let pointerPresent = false;
let lastFrame = 0;

// Flat rest pose everywhere; the animation loop drives any tilt from here
const rest = { x: 0.35, y: 0.3, amp: 0 };
const pose = { ...rest };
const target = { ...rest };

function applyPose() {
  if (!card) return;
  const { x, y, amp } = pose;
  const dist = Math.hypot(x - 0.5, y - 0.5) * 2;
  // Overlay positions must stay in 0-100%: beyond that, the edge of the
  // background tiles (holo-foil/holo-insignia) enters the card and the
  // repeating gradient shows its seam. Tilt still extrapolates from the
  // unclamped values so the card leans toward an off-card pointer.
  card.style.setProperty("--mx", `${(clamp(x) * 100).toFixed(2)}%`);
  card.style.setProperty("--my", `${(clamp(y) * 100).toFixed(2)}%`);
  card.style.setProperty("--rx", `${((0.5 - y) * amp).toFixed(2)}deg`);
  card.style.setProperty("--ry", `${((x - 0.5) * amp).toFixed(2)}deg`);
  card.style.setProperty("--o", clamp(0.45 + dist * 0.55).toFixed(2));
}

function setTarget(px: number, py: number, amp = 6) {
  target.x = px;
  target.y = py;
  target.amp = amp;
}

function fromPointer(e: PointerEvent) {
  if (!card || e.pointerType === "touch") return;
  const rect = card.getBoundingClientRect();
  lastInput = performance.now();
  pointerPresent = true;
  setTarget(
    clamp((e.clientX - rect.left) / rect.width, -0.2, 1.2),
    clamp((e.clientY - rect.top) / rect.height, -0.2, 1.2),
  );
}

let neutral: { gamma: number; beta: number } | null = null;

// How far the phone has to tilt (degrees) to sweep the shine to the card's
// edge. A reflection's offset on a flat surface goes with the sine of the
// tilt, so small movements shift it gently and it eases out near the limit
// instead of tracking the angle linearly
const TILT_RANGE = 60;
const tiltGain = 0.5 / Math.sin((TILT_RANGE * Math.PI) / 180);

function lean(deg: number) {
  if (deg > 180) deg -= 360;
  if (deg < -180) deg += 360;
  const rad = clamp((deg * Math.PI) / 180, -Math.PI / 2, Math.PI / 2);
  return clamp(Math.sin(rad) * tiltGain, -0.5, 0.5);
}

function fromOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  lastInput = performance.now();
  // The pose when tracking starts is treated as level; tilt is measured from
  // there. Only the shine moves on touch devices — tilting the whole card
  // there mostly wobbles the text (amp 0 keeps the card itself level)
  neutral ??= { gamma: e.gamma, beta: e.beta };
  setTarget(
    0.5 - lean(e.gamma - neutral.gamma),
    0.5 - lean(e.beta - neutral.beta),
    0,
  );
}

if (card) {
  applyPose();
  globalThis.addEventListener("pointermove", fromPointer);
  globalThis.addEventListener("pointerdown", fromPointer);
  // Hand off to the drift loop as soon as the pointer leaves the page or
  // the window loses focus, instead of holding the last tracked pose
  const release = () => {
    lastInput = -Infinity;
    pointerPresent = false;
  };
  document.addEventListener("mouseleave", release);
  globalThis.addEventListener("blur", release);

  let drifting = false;
  let driftPhase = 0;
  const driftW = 0.33;
  const driftH = 0.25;

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;
    // No idle drift on touch devices: they get the orientation-driven shine
    // behind the "Tap to activate" button instead
    if (!pointerPresent && now - lastInput >= 2500 && !reducedMotion.matches && !coarsePointer.matches) {
      if (!drifting) {
        // Resume the loop at the point closest to the current pose so the
        // handoff glides in instead of swinging through the center
        drifting = true;
        driftPhase = Math.atan2((pose.x - 0.5) / driftW, (pose.y - 0.5) / driftH);
      }
      driftPhase += dt * 0.3;
      setTarget(
        0.5 + Math.sin(driftPhase) * driftW,
        0.5 + Math.cos(driftPhase) * driftH,
        8,
      );
    } else {
      drifting = false;
    }
    // Exponential smoothing: pointer input and drift resume blend together
    // instead of snapping between poses
    // Snappy convergence while tracking the pointer; slow while drifting so
    // the idle motion eases out of the rest pose instead of kicking in
    const rate = drifting ? 1.5 : 8;
    const k = 1 - Math.exp(-dt * rate);
    pose.x += (target.x - pose.x) * k;
    pose.y += (target.y - pose.y) * k;
    pose.amp += (target.amp - pose.amp) * k;
    applyPose();
  };
  requestAnimationFrame(frame);

  type OrientationCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
  const Orientation = (globalThis as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;
  const enable = document.getElementById("enable-tilt");
  if (Orientation) {
    if (typeof Orientation.requestPermission === "function" && coarsePointer.matches) {
      if (enable) enable.hidden = false;
      enable?.addEventListener("click", async () => {
        const result = await Orientation.requestPermission!();
        if (result === "granted") {
          globalThis.addEventListener("deviceorientation", fromOrientation);
          enable.hidden = true;
        }
      });
    } else if (typeof Orientation.requestPermission !== "function") {
      globalThis.addEventListener("deviceorientation", fromOrientation);
    }
  }
}

const toast = document.getElementById("toast");
let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(message: string) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

document.querySelectorAll<HTMLElement>("[data-copy]").forEach((el) => {
  el.addEventListener("click", async () => {
    const text = el.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${text}`);
    } catch {
      showToast(text);
    }
  });
});

const dialog = document.getElementById("qr-dialog") as HTMLDialogElement | null;
let wakeLock: WakeLockSentinel | null = null;

async function lockScreen() {
  try {
    wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
  } catch {
    wakeLock = null;
  }
}

// The QR code builds up like the holo art on the home page: coarse mosaic
// blocks that sharpen level by level, each cell flashing as it resolves.
// The canvas covers the real SVG, and the last level clears holes through to
// it rather than painting a copy, so nothing shifts when the canvas goes away
const qrBox = document.querySelector<HTMLElement>(".qr-svg");
const QR_BUILD_MS = 700;
// Modules per cell, coarse to fine; a last level reveals the crisp code
const QR_BLOCKS = [8, 4, 2, 1];
let qrBuild = 0;

type QrCell = { x: number; y: number; w: number; h: number; th: number; color?: string };

async function buildQr() {
  const svg = qrBox?.querySelector("svg");
  if (!qrBox || !svg || reducedMotion.matches) return;
  const build = ++qrBuild;
  const finish = () => {
    if (build === qrBuild) qrBox.classList.remove("is-building");
  };
  qrBox.classList.add("is-building");

  let canvas = qrBox.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    qrBox.append(canvas);
  }
  const ctx = canvas.getContext("2d");
  const size = Math.round(svg.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2));
  const grid = svg.viewBox.baseVal.width;
  if (!ctx || !size || !grid) return finish();
  canvas.width = canvas.height = size;
  // Same background as the SVG's, hiding the code until cells reveal it
  const bg = ctx.createLinearGradient(0, 0, size, size);
  svg.querySelectorAll("#qr-bg stop").forEach((stop) => {
    bg.addColorStop(Number(stop.getAttribute("offset")), stop.getAttribute("stop-color")!);
  });
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  try {
    await img.decode();
  } catch {
    return finish();
  }
  if (build !== qrBuild) return;

  // Small render to average the mosaic blocks from
  const PX = 4;
  const small = document.createElement("canvas");
  small.width = small.height = grid * PX;
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(img, 0, 0, grid * PX, grid * PX);
  const pixels = sctx.getImageData(0, 0, grid * PX, grid * PX).data;

  const toPx = (m: number) => Math.round((Math.min(m, grid) * size) / grid);
  const levelCount = QR_BLOCKS.length + 1;
  const levels: QrCell[][] = [...QR_BLOCKS, 1].map((bs, k) => {
    const ang = Math.random() * Math.PI * 2;
    const cells: QrCell[] = [];
    const n = Math.ceil(grid / bs);
    for (let cy = 0; cy < n; cy++) {
      for (let cx = 0; cx < n; cx++) {
        const x0 = cx * bs;
        const y0 = cy * bs;
        const x1 = Math.min(x0 + bs, grid);
        const y1 = Math.min(y0 + bs, grid);
        const scan = ((x0 + x1) / 2 / grid - 0.5) * Math.cos(ang) + ((y0 + y1) / 2 / grid - 0.5) * Math.sin(ang) + 0.5;
        const cell: QrCell = {
          x: toPx(x0),
          y: toPx(y0),
          w: toPx(x1) - toPx(x0),
          h: toPx(y1) - toPx(y0),
          // Mostly random order with only a faint sweep, so levels don't
          // read as separate directional wipes
          th: (k / levelCount) * 0.75 + scan * 0.03 + Math.random() * 0.2,
        };
        if (k < QR_BLOCKS.length) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let py = y0 * PX; py < y1 * PX; py++) {
            for (let px = x0 * PX; px < x1 * PX; px++) {
              const i = (py * grid * PX + px) * 4;
              r += pixels[i];
              g += pixels[i + 1];
              b += pixels[i + 2];
              count++;
            }
          }
          cell.color = `rgb(${r / count | 0} ${g / count | 0} ${b / count | 0})`;
        }
        cells.push(cell);
      }
    }
    return cells;
  });

  // Hairline gaps between mosaic cells give the blocks a pixel-grid look
  const gap = Math.max(1, Math.round(size / 400));
  const start = performance.now();
  const step = (now: number) => {
    if (build !== qrBuild) return;
    const p = Math.min(1, (now - start) / QR_BUILD_MS);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    for (const cells of levels) {
      for (const c of cells) {
        if (p < c.th) continue;
        if (c.color) {
          ctx.fillStyle = c.color;
          const g = c.w > gap * 4 ? gap : 0;
          ctx.fillRect(c.x, c.y, c.w - g, c.h - g);
        } else {
          ctx.clearRect(c.x, c.y, c.w, c.h);
        }
      }
    }
    for (const cells of levels) {
      for (const c of cells) {
        const flash = 1 - (p - c.th) / 0.07;
        if (p < c.th || flash <= 0) continue;
        ctx.fillStyle = `rgb(190 250 255 / ${(flash * 0.7).toFixed(3)})`;
        ctx.fillRect(c.x, c.y, c.w, c.h);
      }
    }
    if (p < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
}

// Light-on-dark codes trip up some older scanner apps, so viewers can flip to
// dark-on-light; the choice sticks for next time
function setQrInverted(inverted: boolean) {
  const svg = qrBox?.querySelector("svg");
  if (!svg || svg.classList.contains("is-inverted") === inverted) return;
  svg.classList.toggle("is-inverted", inverted);
  svg.querySelectorAll("stop[data-alt]").forEach((stop) => {
    const current = stop.getAttribute("stop-color")!;
    stop.setAttribute("stop-color", stop.getAttribute("data-alt")!);
    stop.setAttribute("data-alt", current);
  });
  try {
    localStorage.setItem("qr-inverted", inverted ? "1" : "");
  } catch { /* storage unavailable */ }
}

try {
  if (localStorage.getItem("qr-inverted")) setQrInverted(true);
} catch { /* storage unavailable */ }

const toggleQr = () => {
  setQrInverted(!qrBox?.querySelector("svg")?.classList.contains("is-inverted"));
  buildQr();
};
document.getElementById("qr-invert")?.addEventListener("click", toggleQr);
qrBox?.addEventListener("click", toggleQr);

document.getElementById("qr-open")?.addEventListener("click", () => {
  dialog?.showModal();
  buildQr();
  lockScreen();
});
document.getElementById("qr-close")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
// Browsers drop the wake lock whenever the page is hidden, so take it again
// on return if the code is still showing
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && dialog?.open) lockScreen();
});
dialog?.addEventListener("close", () => {
  wakeLock?.release();
  wakeLock = null;
});
