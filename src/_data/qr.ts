import qrcode from "npm:qrcode-generator@1.4.4";

const URL_TO_ENCODE = "https://itsaury.net/links/";

// Rounded rectangle as a path segment, so shapes can share one evenodd path
function roundRect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
    `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

function buildSvg(text: string) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 3;
  const size = n + quiet * 2;

  // The three 7x7 position markers are drawn as rounded "eyes" instead of
  // module by module
  const finders = [[0, 0], [n - 7, 0], [0, n - 7]];
  const inFinder = (r: number, c: number) => finders.some(([fc, fr]) => c >= fc && c < fc + 7 && r >= fr && r < fr + 7);

  // Every data module is a dot in one path: no seams between neighbours
  const dot = 0.44;
  let dots = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c) || inFinder(r, c)) continue;
      const cx = c + quiet + 0.5;
      const cy = r + quiet + 0.5;
      dots += `M${cx - dot} ${cy}a${dot} ${dot} 0 1 0 ${dot * 2} 0a${dot} ${dot} 0 1 0 ${-dot * 2} 0z`;
    }
  }

  let rings = "";
  let pupils = "";
  for (const [fc, fr] of finders) {
    const x = fc + quiet;
    const y = fr + quiet;
    rings += roundRect(x, y, 7, 7, 2.2) + roundRect(x + 1, y + 1, 5, 5, 1.4);
    pupils += roundRect(x + 2, y + 2, 3, 3, 1);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code linking to ${text}">
<defs>
<linearGradient id="qr-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#170428"/><stop offset="1" stop-color="#0b0016"/></linearGradient>
<linearGradient id="qr-ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ef2ff"/><stop offset="0.5" stop-color="#dccbff"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient>
<linearGradient id="qr-eye" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#5ef2ff"/></linearGradient>
</defs>
<rect width="${size}" height="${size}" fill="url(#qr-bg)"/>
<path fill="url(#qr-ink)" d="${dots}"/>
<path fill="url(#qr-eye)" fill-rule="evenodd" d="${rings}"/>
<path fill="url(#qr-eye)" d="${pupils}"/>
</svg>`;
}

export default buildSvg(URL_TO_ENCODE);
