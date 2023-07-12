import lume from "lume/mod.ts";
import sass from "lume/plugins/sass.ts";

const site = lume();

site.use(sass());

export default site;
