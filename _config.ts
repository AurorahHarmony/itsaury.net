import lume from "lume/mod.ts";
import transformImages from "lume/plugins/transform_images.ts";
import metas from "lume/plugins/metas.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import readInfo from "lume/plugins/reading_info.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import text from "lume/core/loaders/text.ts";

const site = lume({
  location: new URL("https://itsaury.net"),
  server: {
    page404: "/404/",
  },
});

site
  .use(sass())
  .use(transformImages())
  .use(nunjucks())
  .use(metas())
  .use(
    readInfo({
      extensions: [".md", ".mdx"],
    })
  )
  .use(sitemap({ query: "indexable!=false" }));

/** Generates a gradient for project cards */
site.filter(
  "formatGradient",
  (colorStops: { percent: string; color: string }[]) => {
    if (Array.isArray(colorStops) && colorStops.length > 0) {
      const stops = colorStops.map((stop) => `${stop.color} ${stop.percent}%`);
      return `linear-gradient(59deg, ${stops.join(",")})`;
    } else {
      return "linear-gradient(59deg, rgba(99,24,195,1) 0%, rgba(37,41,139,1) 100%)";
    }
  }
);

/** Generates an excerpt from some text */
site.filter("excerpt", (text: string, maxChars: number = 160) => {
  if (text.length <= maxChars) return text;
  const trimmedText = text.substring(0, maxChars);
  return trimmedText.substring(0, trimmedText.lastIndexOf(" ")) + "...";
});

site.filter("currentYear", (): string => {
  return new Date().getFullYear().toString();
});

site.copy("static", ".");

export default site;
