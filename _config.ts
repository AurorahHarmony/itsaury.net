import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import metas from "lume/plugins/metas.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import sitemap from "lume/plugins/sitemap.ts";
import esbuild from "lume/plugins/esbuild.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import feed from "lume/plugins/feed.ts";

const site = lume({
  location: new URL("https://itsaury.net"),
  src: "./src",
});

site
  .use(date())
  .use(jsx())
  .use(mdx())
  .use(metas())
  .use(tailwindcss())
  .use(postcss())
  .use(esbuild({ extensions: [".ts"] }))
  .use(codeHighlight())
  .use(
    readingInfo({
      extensions: [".mdx", ".md"],
      wordsPerMinute: 200,
    })
  );
site.use(sitemap());
site.use(
  feed({
    output: "/blog/feed.xml",
    query: "type=blog-post",
    info: {
      title: "Aury's blog",
      description: "Projects, prosthetics, synths and other things I make.",
    },
    items: { title: "=title", description: "=excerpt" },
  }),
);

site.process([".html"], (pages) => {
  for (const page of pages) {
    if (page.data.type !== "blog-post") continue;
    const prose = page.document?.querySelector(".prose");
    const heads = prose ? [...prose.querySelectorAll("h2, h3")] : [];
    if (!prose || heads.length < 3) continue;

    const used = new Set<string>();
    const items = heads.map((h) => {
      const text = h.textContent.trim();
      const base = h.id ||
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      h.id = id;
      const depth = h.tagName === "H3" ? ' class="toc-sub"' : "";
      return `<li${depth}><a href="#${id}">${text}</a></li>`;
    });

    const nav = page.document!.createElement("nav");
    nav.className = "toc holo-panel";
    nav.setAttribute("aria-label", "Table of contents");
    nav.innerHTML =
      `<p class="hud-label">Contents</p><ul>${items.join("")}</ul>`;
    prose.parentElement!.before(nav);
  }
});

site.add("/styles.css");
site.add("/js");
site.copy("static", ".");

const getCommitInfo = async () => {
  let commitHash = "";
  try {
    const cmd = new Deno.Command("git", {
      args: ["rev-parse", "HEAD"],
    });
    const { stdout } = await cmd.output();
    commitHash = new TextDecoder().decode(stdout).trim();
  } catch {
    console.warn("Could not retrieve git commit hash");
  }

  const repo = "https://github.com/aurorahHarmony/itsaury.net";

  const info = {
    hash: commitHash,
    shortHash: commitHash.slice(0, 7),
    repo,
    commitUrl: commitHash ? `${repo}/commit/${commitHash}` : null,
  };

  return info;
};

site.data("git", await getCommitInfo());

export default site;
