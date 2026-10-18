export const title = "Signal lost";
export const ogImage = "/img/og-default.png";
export const url = "/404.html";

export default (data: Lume.Data) => {
  const { comp } = data;
  return (
    <comp.Container class="max-w-2xl py-16 text-center">
      <p class="hud-label mb-3">Error 404</p>
      <h1 class="text-gradient mb-4 text-5xl sm:text-7xl">Signal lost</h1>
      <p class="mb-8 text-lavender/80">
        The page you're looking for drifted out of range, or never existed. Let's get you back to base.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/" class="btn-pixel">Return home</a>
        <a href="/blog/" class="btn-ghost">Read the blog</a>
      </div>
    </comp.Container>
  );
};
