// @ts-nocheck: Satori takes numeric CSS lengths, which Lume's JSX types reject
// Shared scene for the generated Open Graph cards (1200x630 PNGs rendered by
// the og_images plugin). Satori only understands a subset of CSS: every element
// with more than one child needs display: flex, and styles must be inline.

const art = await Deno.readFile(new URL("../../static/img/aury2.png", import.meta.url));
const artSrc = `data:image/png;base64,${btoa(Array.from(art, (b) => String.fromCharCode(b)).join(""))}`;

export const C = {
  void: "#0b0016",
  night: "#150021",
  deep: "#24093f",
  magenta: "#ff4fd8",
  holo: "#5ef2ff",
  lavender: "#dccbff",
  ink: "#f4ecff",
  sun: "#ffd36e",
};

// Fixed star field so every card shares the same sky
const stars = [
  [42, 38, 2], [180, 22, 3], [310, 64, 2], [455, 30, 2], [600, 18, 3], [690, 72, 2],
  [880, 26, 2], [1010, 48, 3], [1150, 20, 2], [1120, 120, 2], [960, 150, 2],
  [720, 140, 2], [80, 160, 2], [250, 120, 2], [520, 110, 3], [1180, 210, 2],
];

// Sun bands: the gaps widen towards the horizon, like the site's backdrop
const bands = [0, 1, 2, 3, 4, 5].map((i) => ({ top: 236 + i * 32, height: 4 + i * 3 }));

const bracket = (pos: Record<string, number>, borders: Record<string, string>) => (
  <div style={{ position: "absolute", width: 22, height: 22, ...pos, ...borders }} />
);

export const Logo = () => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
    <span style={{ fontFamily: "Pixelify Sans", fontWeight: 600, fontSize: 34, color: C.ink }}>ITSAURY</span>
    <span style={{ fontFamily: "Silkscreen", fontSize: 16, letterSpacing: 3, color: C.holo }}>.NET</span>
  </div>
);

export const Label = ({ children }: { children: unknown }) => (
  <div style={{ display: "flex", fontFamily: "Silkscreen", fontSize: 20, letterSpacing: 4, color: C.holo, textTransform: "uppercase" }}>
    {children}
  </div>
);

export const Card = ({ children }: { children: unknown }) => {
  const edge = `3px solid ${C.holo}`;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundImage: `linear-gradient(180deg, ${C.void} 0%, ${C.night} 55%, ${C.deep} 100%)`,
        fontFamily: "Outfit",
        color: C.ink,
      }}
    >
      {stars.map(([x, y, s]) => (
        <div style={{ position: "absolute", left: x, top: y, width: s, height: s, backgroundColor: C.ink, opacity: 0.7 }} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 690,
          top: 60,
          width: 420,
          height: 420,
          borderRadius: 210,
          display: "flex",
          backgroundImage: `linear-gradient(180deg, ${C.sun} 0%, #ff9a8a 45%, ${C.magenta} 100%)`,
        }}
      />
      {bands.map((b) => (
        <div style={{ position: "absolute", left: 680, width: 440, top: 60 + b.top, height: b.height, backgroundColor: C.night }} />
      ))}

      {/* Grid floor */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, display: "flex", flexDirection: "column", backgroundImage: `linear-gradient(180deg, ${C.deep}00, ${C.deep})` }}>
        {[0, 18, 40, 66, 96, 130].map((y) => (
          <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 2, backgroundColor: C.magenta, opacity: 0.25 + y / 260 }} />
        ))}
      </div>

      <img src={artSrc} width={685} height={560} style={{ position: "absolute", right: -40, bottom: 0 }} />

      {/* Post details in a holo panel, matching the site's cards */}
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 56,
          bottom: 56,
          width: 640,
          display: "flex",
          flexDirection: "column",
          padding: "40px 44px",
          backgroundColor: "rgba(21, 0, 33, 0.82)",
          border: `1px solid rgba(94, 242, 255, 0.3)`,
        }}
      >
        {bracket({ left: -1, top: -1 }, { borderLeft: edge, borderTop: edge })}
        {bracket({ right: -1, top: -1 }, { borderRight: edge, borderTop: edge })}
        {bracket({ left: -1, bottom: -1 }, { borderLeft: edge, borderBottom: edge })}
        {bracket({ right: -1, bottom: -1 }, { borderRight: edge, borderBottom: edge })}

        {children}
      </div>
    </div>
  );
};
