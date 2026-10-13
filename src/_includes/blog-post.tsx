export const layout = "base.vto";
export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, children, title, date, readingInfo, tags } = data;
  return (
    <comp.Container class="max-w-3xl">
      <a href="/blog/" class="link font-hud text-xs uppercase tracking-widest">
        &lt; All posts
      </a>
      <header class="mt-4 mb-6">
        <p class="hud-label mb-2">
          Log {filters.date(date, "y-MM-dd")} · {readingInfo?.minutes ?? 1} min read
        </p>
        <h1 class="mb-3 text-4xl sm:text-5xl">{title}</h1>
        <ul class="flex flex-wrap gap-1.5">
          {(tags ?? []).map((tag: string) => (
            <li class="bg-white/5 px-2 py-0.5 font-mono text-xs text-lavender/80">
              #{tag}
            </li>
          ))}
        </ul>
      </header>
      <div class="holo-panel p-6 sm:p-8">
        <div class="prose prose-custom">{children}</div>
      </div>
      <script type="module" src="/js/lightbox.js"></script>
      <script type="module" src="/js/code-copy.js"></script>
    </comp.Container>
  );
};
