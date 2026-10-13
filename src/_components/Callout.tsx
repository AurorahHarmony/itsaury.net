interface Props {
  title?: string;
  tone?: "note" | "warning";
  children?: unknown;
}

export default ({ title = "SYS NOTE", tone = "note", children }: Props) => (
  <aside
    class="not-prose holo-panel my-6 px-5 py-4 text-lavender"
    style={`--bracket: ${tone === "warning" ? "var(--color-sun)" : "var(--color-holo)"}`}
  >
    <p
      class="hud-label mb-2"
      style={tone === "warning" ? "color: var(--color-sun)" : ""}
    >
      {tone === "warning" ? "⚠ " : "▸ "}
      {title}
    </p>
    <div class="callout-body">{children}</div>
  </aside>
);
