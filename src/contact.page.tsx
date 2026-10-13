import socials, { profile } from "./_data/socials.ts";

export const title = "Contact";

export default (data: Lume.Data) => {
  const { comp } = data;
  return (
    <comp.Container class="max-w-3xl">
      <p class="hud-label mb-3">Open channel</p>
      <h1 class="mb-3 text-4xl sm:text-5xl">Contact</h1>
      <p class="mb-8 text-lavender/80">
        Email is best for anything serious. Everywhere else, say hi!
      </p>
      <ul class="grid gap-3 sm:grid-cols-2">
        {socials.map((social) => (
          <li>
            {social.url
              ? (
                <a
                  href={social.url}
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  class="holo-panel flex items-center gap-3 p-4 text-ink no-underline transition hover:-translate-y-0.5"
                >
                  <comp.Icon name={social.icon} />
                  <span class="font-hud text-xs uppercase tracking-widest">{social.name}</span>
                  <span class="ml-auto truncate font-mono text-xs text-lavender/60">
                    {social.name === "Email" ? profile.email : ""}
                  </span>
                </a>
              )
              : (
                <div class="holo-panel flex items-center gap-3 p-4 text-ink">
                  <comp.Icon name={social.icon} />
                  <span class="font-hud text-xs uppercase tracking-widest">{social.name}</span>
                  <span class="ml-auto font-mono text-xs text-lavender/60">{social.copy}</span>
                </div>
              )}
          </li>
        ))}
      </ul>
    </comp.Container>
  );
};
