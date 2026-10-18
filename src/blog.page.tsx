export const title = "Blog";
export const metas = { description: "=blogDescription" };

export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, search, blogDescription } = data;

  const posts = search.pages("type=blog-post", "date=desc");

  return (
    <comp.Container class="max-w-3xl">
      <p class="hud-label mb-3">Data log</p>
      <h1 class="mb-2 text-4xl sm:text-5xl">Blog</h1>
      <p class="mb-8 text-lavender/80">
        {blogDescription}{" "}
        <a href="/blog/feed.xml" class="link">RSS</a>
      </p>
      {posts.length === 0 && (
        <p class="holo-panel p-5 text-lavender/80">
          First transmission incoming. Subscribe to the <a href="/blog/feed.xml" class="link">RSS feed</a> to catch it.
        </p>
      )}
      <ul class="space-y-4">
        {posts.map((post) => (
          <li>
            <a
              href={post.url}
              class="holo-panel block p-5 no-underline transition hover:-translate-y-0.5"
            >
              <p class="hud-label mb-1">
                <time datetime={post.date.toISOString()}>{filters.date(post.date, "y-MM-dd")}</time> · {post.readingInfo?.minutes ?? 1} min
              </p>
              <h2 class="mb-1 text-2xl">{post.title}</h2>
              {post.excerpt && <p class="text-lavender/80">{post.excerpt}</p>}
              <ul class="mt-3 flex flex-wrap gap-1.5">
                {(post.tags ?? []).map((tag: string) => (
                  <li class="bg-white/5 px-2 py-0.5 font-mono text-xs text-lavender/80">
                    #{tag}
                  </li>
                ))}
              </ul>
            </a>
          </li>
        ))}
      </ul>
    </comp.Container>
  );
};
