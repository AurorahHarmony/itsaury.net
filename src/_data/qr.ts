import qrcode from "npm:qrcode-generator@1.4.4";

const URL_TO_ENCODE = "https://itsaury.net/links/";

// Rounded rectangle as a path segment, so shapes can share one evenodd path
function roundRect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
    `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

// Each stop carries its dark-on-light colour too, which links.ts swaps in when
// the viewer inverts the code for scanners that can't read light-on-dark
function gradient(id: string, stops: [string, string][]) {
  const step = 1 / (stops.length - 1);
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    stops.map(([dark, light], i) => `<stop offset="${i * step}" stop-color="${dark}" data-alt="${light}"/>`).join("") +
    `</linearGradient>`;
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
${gradient("qr-bg", [["#170428", "#fbf7ff"], ["#0b0016", "#efe4ff"]])}
${gradient("qr-ink", [["#5ef2ff", "#3a1290"], ["#dccbff", "#5b1fc0"], ["#ff4fd8", "#9a1488"]])}
${gradient("qr-eye", [["#ff4fd8", "#b3138f"], ["#5ef2ff", "#5b1fc0"]])}
</defs>
<rect width="${size}" height="${size}" fill="url(#qr-bg)"/>
<path fill="url(#qr-ink)" d="${dots}"/>
<path fill="url(#qr-eye)" fill-rule="evenodd" d="${rings}"/>
<path fill="url(#qr-eye)" d="${pupils}"/>
</svg>`;
}

export default buildSvg(URL_TO_ENCODE);
