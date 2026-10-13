import qrcode from "npm:qrcode-generator@1.4.4";

const URL_TO_ENCODE = "https://itsaury.net/links/";

function buildSvg(text: string) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 4;
  const size = n + quiet * 2;
  const rects: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        rects.push(`<rect x="${c + quiet}" y="${r + quiet}" width="1.04" height="1.04"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code linking to ${text}" shape-rendering="crispEdges">
<defs><linearGradient id="qrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b19a8"/><stop offset="1" stop-color="#b3138f"/></linearGradient></defs>
<rect width="${size}" height="${size}" fill="#fbf7ff"/>
<g fill="url(#qrg)">${rects.join("")}</g></svg>`;
}

export default buildSvg(URL_TO_ENCODE);
