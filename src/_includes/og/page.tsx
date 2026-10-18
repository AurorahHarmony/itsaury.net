// @ts-nocheck: Satori takes numeric CSS lengths, which Lume's JSX types reject
// Open Graph card for the site's other pages: section label, title and the
// page's meta description
import { C, Card, Label, Logo } from "./shared.tsx";

export default (data: Lume.Data) => {
  const { title, subtitle, metas, url } = data;
  // Descriptions written as "=key" point at other page data
  const raw = subtitle ?? metas?.description ?? "";
  const description = raw.startsWith("=") ? data[raw.slice(1)] ?? "" : raw;
  const size = title.length > 34 ? 58 : 84;
  const section = url?.split("/")[1] || "Transmission";

  return (
    <Card>
      <Label>{`Signal // ${section}`}</Label>

      <div
        style={{
          display: "block",
          marginTop: 28,
          fontFamily: "Pixelify Sans",
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.08,
          lineClamp: 3,
          flexShrink: 0,
          textShadow: `0 0 18px rgba(255, 79, 216, 0.55)`,
        }}
      >
        {title}
      </div>

      {description && (
        <div style={{ display: "block", marginTop: 24, fontSize: 28, lineHeight: 1.4, color: C.lavender, lineClamp: 4 }}>
          {description}
        </div>
      )}

      <div style={{ display: "flex", marginTop: "auto", paddingTop: 20, flexShrink: 0, justifyContent: "flex-end" }}>
        <Logo />
      </div>
    </Card>
  );
};
