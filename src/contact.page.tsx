import socials, { profile } from "./_data/socials.ts";

export const title = "Contact";

export default (data: Lume.Data) => {
  const { comp } = data;
  const channels = socials.filter((social) => social.name !== "TailPlume");
  return (
    <comp.Container class="max-w-3xl">
      <p class="hud-label mb-3">Open channel</p>
      <h1 class="mb-3 text-4xl sm:text-5xl">Contact</h1>
      <p class="mb-8 text-lavender/80">
        Email is best for anything serious. Everywhere else, say hi!
      </p>
      <ul class="grid gap-3 sm:grid-cols-2">
        {channels.map((social) => (
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

      <a
        href="/links/"
        class="holo-panel group mt-8 flex items-center gap-5 p-6 text-ink no-underline transition hover:-translate-y-0.5"
      >
        <span
          class="icon !size-12 shrink-0 text-holo drop-shadow-[0_0_8px_var(--color-holo)] transition group-hover:text-magenta"
          style="--icon: url(/icons/qr-code.svg)"
          aria-hidden="true"
        />
        <span class="min-w-0">
          <span class="block text-xl">Meeting me at a con?</span>
          <span class="block text-sm text-lavender/80">
            Grab my holo card: every link in one place, with a QR code to scan.
          </span>
        </span>
        <span class="btn-pixel ml-auto shrink-0 max-sm:hidden">Open the con card</span>
      </a>
    </comp.Container>
  );
};
