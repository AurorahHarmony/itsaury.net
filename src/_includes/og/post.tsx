// @ts-nocheck: Satori takes numeric CSS lengths, which Lume's JSX types reject
// Open Graph card for blog posts: title, excerpt, date, reading time and tags
import { C, Card, Label, Logo } from "./shared.tsx";

export default ({ title, excerpt, date, readingInfo, tags }: Lume.Data) => {
  const day = date instanceof Date ? date.toISOString().slice(0, 10) : "";
  const minutes = readingInfo?.minutes ?? 1;
  // Longer titles get a smaller face and leave fewer lines for the excerpt
  const long = title.length > 34;
  const size = title.length > 60 ? 44 : long ? 58 : 74;

  // Only as many whole tags as fit beside the logo (roughly 30 characters)
  let budget = 30;
  const shown = (tags ?? []).filter((tag: string) => (budget -= tag.length + 3) >= 0);

  return (
    <Card>
      <Label>{`Log ${day} · ${minutes} min read`}</Label>

      <div
        style={{
          display: "block",
          marginTop: 22,
          fontFamily: "Pixelify Sans",
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.08,
          lineClamp: title.length > 60 ? 4 : 3,
          flexShrink: 0,
          textShadow: `0 0 18px rgba(255, 79, 216, 0.55)`,
        }}
      >
        {title}
      </div>

      {excerpt && (
        <div style={{ display: "block", marginTop: 20, fontSize: 26, lineHeight: 1.4, color: C.lavender, lineClamp: long ? 2 : 3 }}>
          {excerpt}
        </div>
      )}

      <div style={{ display: "flex", marginTop: "auto", paddingTop: 20, flexShrink: 0, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, maxWidth: 380, overflow: "hidden" }}>
          {shown.map((tag: string) => (
            <div style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", padding: "4px 10px", fontSize: 20, color: C.lavender, backgroundColor: "rgba(255, 255, 255, 0.06)" }}>
              {`#${tag}`}
            </div>
          ))}
        </div>
        <Logo />
      </div>
    </Card>
  );
};
