const card = document.querySelector<HTMLElement>(".holo-card");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

let lastInput = -Infinity;

function setPose(px: number, py: number, amp = 6) {
  if (!card) return;
  const dist = Math.hypot(px - 0.5, py - 0.5) * 2;
  card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
  card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  card.style.setProperty("--rx", `${((0.5 - py) * amp).toFixed(2)}deg`);
  card.style.setProperty("--ry", `${((px - 0.5) * amp).toFixed(2)}deg`);
  card.style.setProperty("--o", clamp(0.45 + dist * 0.55).toFixed(2));
}

function fromPointer(e: PointerEvent) {
  if (!card) return;
  const rect = card.getBoundingClientRect();
  lastInput = performance.now();
  setPose(
    clamp((e.clientX - rect.left) / rect.width, -0.2, 1.2),
    clamp((e.clientY - rect.top) / rect.height, -0.2, 1.2),
  );
}

function fromOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  lastInput = performance.now();
  setPose(
    0.5 + clamp(e.gamma / 35, -1, 1) * 0.5,
    0.5 + clamp((e.beta - 45) / 35, -1, 1) * 0.5,
    12,
  );
}

if (card) {
  setPose(0.35, 0.3);
  globalThis.addEventListener("pointermove", fromPointer);
  globalThis.addEventListener("pointerdown", fromPointer);

  if (!reducedMotion.matches) {
    const drift = (now: number) => {
      requestAnimationFrame(drift);
      if (now - lastInput < 2500) return;
      const t = now / 1000;
      setPose(0.5 + Math.sin(t * 0.55) * 0.38, 0.5 + Math.cos(t * 0.4) * 0.3);
    };
    requestAnimationFrame(drift);
  }

  type OrientationCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
  const Orientation = (globalThis as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;
  const enable = document.getElementById("enable-tilt");
  if (Orientation) {
    if (typeof Orientation.requestPermission === "function" && matchMedia("(pointer: coarse)").matches) {
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
