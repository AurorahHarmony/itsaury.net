import lume from "lume/mod.ts";
import imagick from "lume/plugins/imagick.ts";
import sass from "lume/plugins/sass.ts";

const site = lume();

site.use(sass()).use(imagick());

site.copy("static", ".");

export default site;
