// The home page keeps the hand-made card instead of a generated one
export const ogImage = "/img/og-default.png";

import socials, { profile } from "./_data/socials.ts";

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://itsaury.net/#website",
      name: "Aury - Code Synth",
      url: "/",
      author: { "@id": "https://itsaury.net/#aury" },
    },
    {
      "@type": "Person",
      "@id": "https://itsaury.net/#aury",
      name: "Aurorah Harmony",
      alternateName: "Aury",
      url: "/",
      image: "/img/aury2.png",
      jobTitle: "Software engineer",
      homeLocation: { "@type": "Country", name: "New Zealand" },
      sameAs: socials.flatMap((s) => s.url?.startsWith("https://") ? [s.url] : []),
    },
  ],
};

export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, search } = data;

  const posts = search.pages("type=blog-post", "date=desc", 5);
  const projects = search.pages("type=project pinned=true", "order");
  const stats = [
    { label: "Class", value: "Software engineer" },
    { label: "Species", value: "Synth creature" },
    { label: "Home server", value: "New Zealand" },
    { label: "Skills", value: "TypeScript, PHP, C++, Node.js" },
    { label: "Hobbies", value: "3D printing, music, VR" },
    { label: "Quest", value: "Prosthetic tail" },
  ];
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
            {projects.length > 0 && (
              <a href="/projects/" class="btn-ghost">View projects</a>
            )}
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

      <comp.Container class="mb-16">
        <section class="holo-panel grid gap-6 p-6 md:grid-cols-[auto_1fr]">
          <div class="text-center md:text-left">
            <p class="hud-label mb-2">Character select</p>
            <h2 class="text-3xl">Aurorah Harmony</h2>
            <p class="font-mono text-sm text-lavender/70">@aurorah</p>
            <ul class="mt-3 flex flex-wrap justify-center gap-1.5 md:justify-start">
              {profile.pronouns.map((p) => (
                <li class={`rounded-full bg-gradient-to-tr px-2.5 py-0.5 text-sm text-white ${p.gradient}`}>
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
          <dl class="grid gap-x-8 gap-y-3 font-mono text-sm sm:grid-cols-2">
            {stats.map((stat) => (
              <div>
                <dt class="hud-label mb-0.5">{stat.label}</dt>
                <dd class="text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </comp.Container>

      {projects.length > 0 && (
        <comp.Container class="mb-16">
          <div class="mb-5 flex items-end justify-between">
            <h2 class="text-3xl">Featured projects</h2>
            <a href="/projects/" class="link font-hud text-xs uppercase tracking-widest">
              All projects
            </a>
          </div>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => <comp.ProjectCard project={project} />)}
          </div>
        </comp.Container>
      )}

      <comp.Container class="mb-16 grid gap-6 md:grid-cols-2">
        <section class="holo-panel p-5">
          <h2 class="mb-3 text-2xl">Recent posts</h2>
          {posts.length === 0 && <p class="text-lavender/80">First transmission incoming.</p>}
          <ul class="space-y-1.5">
            {posts.map((post) => (
              <li>
                <a href={post.url} class="link">
                  <time datetime={post.date.toISOString()} class="font-mono text-sm text-lavender/60">
                    {filters.date(post.date, "y-MM-dd")}
                  </time>{" "}
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
          <a href="/blog/" class="link mt-4 inline-block font-hud text-xs uppercase tracking-widest">
            All posts
          </a>
        </section>
        <section class="holo-panel flex flex-col items-start p-5">
          <h2 class="mb-2 text-2xl">Meeting me at a con?</h2>
          <p class="mb-4 text-lavender/80">
            Grab my holo card: every link in one place, with a QR code to scan.
          </p>
          <a href="/links/" class="btn-pixel mt-auto">Open the con card</a>
        </section>
      </comp.Container>

      <script type="module" src="/js/holo-art.js"></script>
    </>
  );
};
