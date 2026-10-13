import { Social } from "./_data/socials.ts";

export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, search, socials } = data;

  const posts = search.pages("type=blog-post", "date=desc", 8);
  return (
    <>
      <comp.Container class="grid items-center gap-10 pt-4 pb-16 md:grid-cols-[1fr_1.1fr] md:pt-10">
        <div class="order-2 text-center md:order-1 md:text-left">
          <p class="hud-label mb-4">
            <span class="animate-blink">▸</span> Uplink established
          </p>
          <h1 class="mb-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Hi, I'm <span class="text-gradient">Aury</span>!
          </h1>
          <p class="mb-3 text-xl text-ink">
            Software engineer, synth creature, and lover of dreams and stars from
            New Zealand.
          </p>
          <p class="mb-8 text-lavender/80">
            In my spare time I volunteer between different organisations, do 3D
            printing, make music, and spend time in VR.
          </p>
          <div class="flex flex-wrap justify-center gap-3 md:justify-start">
            <a href="/blog/" class="btn-pixel">Read the blog</a>
            <a href="/projects/" class="btn-ghost">View projects</a>
          </div>
        </div>

        <div class="relative order-1 mx-auto w-full max-w-md md:order-2 md:max-w-none">
          <div class="holo-beam"></div>
          <div class="holo-pedestal"></div>
          <div class="animate-float">
            <comp.HoloArt
              src="/img/aury2.png"
              alt="Aurorah, a pink and purple winged synth creature, smiling with paws together"
              width={1040}
              height={850}
              resolution={3}
            />
          </div>
        </div>
      </comp.Container>

      <comp.Container class="grid gap-6 md:grid-cols-2">
        <section class="holo-panel p-5">
          <h2 class="mb-3 text-2xl">Recent posts</h2>
          <ul class="space-y-1.5">
            {posts.map((post) => (
              <li>
                <a href={post.url} class="link">
                  <span class="font-mono text-sm text-lavender/60">
                    {filters.date(post.date, "y-MM-dd")}
                  </span>{" "}
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section class="holo-panel p-5">
          <h2 class="mb-3 text-2xl">Quick links</h2>
          <ul class="flex flex-wrap gap-2">
            {socials.map((social: Social) => (
              <li>
                <a href={social.url} target="_blank" rel="noopener" class="btn-ghost">
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </comp.Container>

      <script type="module" src="/js/holo-art.js"></script>
    </>
  );
};
