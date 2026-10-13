export const layout = "base.vto";
export default (data: Lume.Data) => {
  const { comp, children, title, subtitle, accent, accent2, status, stack, url_external } = data;
  return (
    <comp.Container class="max-w-3xl">
      <a href="/projects/" class="link font-hud text-xs uppercase tracking-widest">
        &lt; All projects
      </a>
      <header
        class="holo-panel mt-4 mb-8 p-6"
        style={`--bracket: ${accent}`}
      >
        <p class="hud-label mb-2" style={`color: ${accent}`}>{status}</p>
        <h1 class="mb-1 text-4xl sm:text-5xl">{title}</h1>
        <p class="mb-4 text-lg text-lavender">{subtitle}</p>
        <div
          class="mb-4 h-1.5 w-full"
          style={`background: linear-gradient(90deg, ${accent}, ${accent2})`}
        >
        </div>
        <ul class="mb-4 flex flex-wrap gap-1.5">
          {(stack ?? []).map((tech: string) => (
            <li class="bg-white/5 px-2 py-0.5 font-mono text-xs">{tech}</li>
          ))}
        </ul>
        {url_external && (
          <a href={url_external} target="_blank" rel="noopener" class="btn-pixel">
            Visit site
          </a>
        )}
      </header>
      <div class="holo-panel p-6 sm:p-8">
        <div class="prose prose-custom">{children}</div>
      </div>
    </comp.Container>
  );
};
