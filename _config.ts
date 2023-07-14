import lume from "lume/mod.ts";
import imagick from "lume/plugins/imagick.ts";
import metas from "lume/plugins/metas.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume({
  location: new URL("https://itsaury.net"),
  server: {
    page404: "/404/",
  },
});

site
  .use(sass())
  .use(imagick())
  .use(metas())
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

site.filter("currentYear", (): string => {
  return new Date().getFullYear().toString();
});

site.copy("static", ".");

export default site;
