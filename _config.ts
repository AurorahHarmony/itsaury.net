import lume from "lume/mod.ts";
import imagick from "lume/plugins/imagick.ts";
import sass from "lume/plugins/sass.ts";

const site = lume();

site.use(sass()).use(imagick());

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

site.copy("static", ".");

export default site;
