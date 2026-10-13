import socials, { profile } from "./_data/socials.ts";

export const title = "Links";
export const layout = "bare.vto";


export default (data: Lume.Data) => {
  const { comp, qr } = data;
  const links = [
    ...socials.filter((s) => s.name !== "Email" && s.name !== "TailPlume"),
    { name: "Email", icon: "envelope-fill", url: `mailto:${profile.email}` },
    { name: "Website", icon: "link-45deg", url: "https://itsaury.net", wide: true },
  ];

  return (
    <>
      <main class="flex min-h-svh items-center justify-center px-3 py-10">
        <div class="holo-card-scene w-full max-w-sm">
          <article class="holo-card">
            <div class="holo-card-inner">
              <button
                type="button"
                id="qr-open"
                class="absolute top-3 right-3 z-10 p-1.5 text-lavender/70 transition hover:text-holo"
                aria-label="Show QR code"
              >
                <span class="icon !size-6" style="--icon: url(/icons/qr-code.svg)" aria-hidden="true" />
              </button>

              <div class="card-art relative mx-auto mb-3 w-4/5">
                <comp.HoloArt
                  src="/img/aury2.png"
                  alt="Aury, a pink and purple winged synth creature"
                  width={1040}
                  height={850}
                  resolution={2}
                />
              </div>

              <div class="mb-4 text-center">
                <h1 class="text-2xl">{profile.name}</h1>
                <ul class="mb-3 flex flex-wrap justify-center gap-1.5 text-sm">
                  {profile.pronouns.map((p) => (
                    <li class={`rounded-full bg-gradient-to-tr px-2.5 py-0.5 text-white ${p.gradient}`}>
                      {p.label}
                    </li>
                  ))}
                </ul>
                <p class="font-light text-ink">
                  {profile.bio[0]}
                  <br />
                  {profile.bio[1]}
                </p>
              </div>

              <ul class="mb-4 grid grid-cols-2 gap-1.5">
                {links.map((link) => (
                  <li class={"copy" in link && link.copy ? "col-span-2" : link.wide ? "col-span-2" : ""}>
                    {"url" in link && link.url
                      ? (
                        <a
                          href={link.url}
                          target={link.url.startsWith("http") ? "_blank" : undefined}
                          rel="noopener"
                          class="card-link"
                        >
                          <comp.Icon name={link.icon} />
                          {link.name}
                        </a>
                      )
                      : (
                        <button type="button" class="card-link w-full" data-copy={"copy" in link ? link.copy : ""}>
                          <comp.Icon name={link.icon} />
                          <span>{link.name}</span>
                          <span class="font-light text-lavender/70" data-copy-label>
                            {"copy" in link ? link.copy : ""}
                          </span>
                        </button>
                      )}
                  </li>
                ))}
              </ul>

              <p class="text-center font-hud text-[0.6rem] tracking-widest text-lavender/50 uppercase">
                <a href="/" class="no-underline hover:text-holo">itsaury.net</a>
              </p>
              <button
                type="button"
                id="enable-tilt"
                class="btn-ghost mt-3 w-full"
                hidden
              >
                Tap to activate shine
              </button>
            </div>
            <div class="holo-insignia" aria-hidden="true"></div>
            <div class="holo-foil" aria-hidden="true"></div>
            <div class="holo-sparkle" aria-hidden="true"></div>
            <div class="holo-glare" aria-hidden="true"></div>
          </article>
        </div>
      </main>

      <dialog id="qr-dialog" class="qr-dialog">
        <div class="qr-dialog-body">
          <div class="mb-3 flex items-start">
            <div>
              <p class="hud-label">Scan to open</p>
              <p class="font-display text-xl text-ink">{profile.name}</p>
            </div>
            <button type="button" id="qr-close" class="ml-auto p-1 text-lavender/70 hover:text-holo" aria-label="Close">
              <span class="icon !size-6" style="--icon: url(/icons/x-lg.svg)" aria-hidden="true" />
            </button>
          </div>
          <div class="qr-svg" dangerouslySetInnerHTML={{ __html: qr }} />
          <p class="mt-3 text-center font-mono text-xs text-lavender/70">itsaury.net/links</p>
        </div>
      </dialog>

      <div id="toast" class="toast" role="status" aria-live="polite"></div>
      <script type="module" src="/js/links.js"></script>
      <script type="module" src="/js/holo-art.js"></script>
    </>
  );
};
