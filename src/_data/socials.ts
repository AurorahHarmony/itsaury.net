const socials = [
  { name: "GitHub", url: "https://github.com/aurorahHarmony" },
  { name: "Keybase", url: "https://keybase.io/aurorahharmony" },
  { name: "Ko-Fi", url: "https://ko-fi.com/aurorahHarmony" },
  { name: "Mastodon", url: "https://pony.social/@aurorahHarmony" },
  { name: "TailPlume", url: "https://tailplu.me/aurorah" },
];

export default socials;

export type Social = (typeof socials)[number];
