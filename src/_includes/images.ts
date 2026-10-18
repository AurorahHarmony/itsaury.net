// Value for the picture plugin's transform-images attribute: AVIF and WebP
// first, then the source's own format as the fallback for older browsers.
// GIFs (possibly animated), SVGs and pixel art are left untouched.
export function transformImages(src: string, size: string, pixelated = false) {
  const ext = src.split(".").pop()?.toLowerCase();
  if (pixelated || !ext || !["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return undefined;
  }
  return `avif webp ${ext === "jpeg" ? "jpg" : ext} ${size}`;
}
