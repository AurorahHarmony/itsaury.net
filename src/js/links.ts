const card = document.querySelector<HTMLElement>(".holo-card");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = matchMedia("(pointer: coarse)");
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

let lastInput = -Infinity;
let lastFrame = 0;

const pose = { x: 0.35, y: 0.3, amp: 6 };
const target = { x: 0.35, y: 0.3, amp: 6 };

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
  setTarget(
    clamp((e.clientX - rect.left) / rect.width, -0.2, 1.2),
    clamp((e.clientY - rect.top) / rect.height, -0.2, 1.2),
  );
}

let neutral: { gamma: number; beta: number } | null = null;

function fromOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  lastInput = performance.now();
  // The pose when tracking starts is treated as level; tilt is measured from
  // there, and the card counter-rotates as if floating over the phone
  neutral ??= { gamma: e.gamma, beta: e.beta };
  let dg = e.gamma - neutral.gamma;
  if (dg > 180) dg -= 360;
  if (dg < -180) dg += 360;
  setTarget(
    0.5 - clamp(dg / 35, -1, 1) * 0.5,
    0.5 - clamp((e.beta - neutral.beta) / 35, -1, 1) * 0.5,
    12,
  );
}

if (card) {
  applyPose();
  globalThis.addEventListener("pointermove", fromPointer);
  globalThis.addEventListener("pointerdown", fromPointer);
  // Hand off to the drift loop as soon as the pointer leaves the page or
  // the window loses focus, instead of holding the last tracked pose
  const release = () => lastInput = -Infinity;
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
    if (now - lastInput >= 2500 && !reducedMotion.matches && !coarsePointer.matches) {
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
    const k = 1 - Math.exp(-dt * 8);
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
let toastTimer = 0;
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

document.getElementById("qr-open")?.addEventListener("click", () => {
  dialog?.showModal();
  lockScreen();
});
document.getElementById("qr-close")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
dialog?.addEventListener("close", () => {
  wakeLock?.release();
  wakeLock = null;
});
