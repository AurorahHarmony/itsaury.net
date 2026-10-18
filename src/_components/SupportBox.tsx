import support, { type SupportMethod } from "../_data/support.ts";

interface Props {
  heading?: string;
  blurb?: string;
  methods?: SupportMethod[];
  class?: string;
}

const Method = ({ method }: { method: SupportMethod }) => {
  const body = (
    <>
      <span class="icon !size-5" style={`--icon: url(/icons/${method.icon}.svg)`} aria-hidden="true" />
      <span class="flex flex-col items-start text-left">
        <span>{method.name}</span>
        {method.note && <span class="font-mono text-[0.65rem] normal-case tracking-normal opacity-70">{method.note}</span>}
      </span>
    </>
  );

  return method.url
    ? (
      <a href={method.url} class="btn-pixel inline-flex items-center gap-2" target="_blank" rel="noopener">
        {body}
      </a>
    )
    : (
      <button
        type="button"
        class="btn-ghost inline-flex items-center gap-2"
        data-support-copy={method.copy}
        aria-label={`Copy ${method.name} address`}
      >
        {body}
      </button>
    );
};

export default ({
  heading = support.heading,
  blurb = support.blurb,
  methods = support.methods,
  class: className = "",
}: Props) => (
  <aside class={`holo-panel p-6 ${className}`} style="--bracket: var(--color-magenta)" aria-label="Support me">
    <p class="hud-label mb-2">▸ Support the Synth</p>
    <h2 class="mb-2 text-2xl">{heading}</h2>
    <p class="mb-5 text-lavender/80">{blurb}</p>
    <div class="flex flex-wrap gap-3">
      {methods.map((method) => <Method method={method} />)}
    </div>
    {methods.some((m) => m.copy) && <script type="module" src="/js/support.js"></script>}
  </aside>
);
