export interface Social {
  name: string;
  icon: string;
  url?: string;
  copy?: string;
}

export const profile = {
  name: "Aurorah Harmony ΘΔ",
  handle: "@aurorah",
  email: "me@itsaury.net",
  bio: ["Lover of Dreams and Stars ✨", "Software Engineer from New Zealand"],
  pronouns: [
    { label: "Xe/Xer", gradient: "from-purple-800 via-indigo-600 to-cyan-500" },
    { label: "She/Her", gradient: "from-purple-800 to-pink-500" },
    { label: "They/Them", gradient: "from-slate-600 to-zinc-400" },
  ],
};

const socials: Social[] = [
  { name: "Discord", icon: "discord", copy: "aurorahHarmony" },
  { name: "Mastodon", icon: "mastodon", url: "https://pony.social/@aurorahHarmony" },
  { name: "Twitter", icon: "twitter", url: "https://twitter.com/aurorahHarmony" },
  { name: "GitHub", icon: "github", url: "https://github.com/aurorahHarmony" },
  { name: "Ko-fi", icon: "cup-hot-fill", url: "https://ko-fi.com/aurorahHarmony" },
  { name: "Keybase", icon: "key-fill", url: "https://keybase.io/aurorahharmony" },
  { name: "TailPlume", icon: "person-badge-fill", url: "https://tailplu.me/aurorah" },
  { name: "Email", icon: "envelope-fill", url: "mailto:me@itsaury.net" },
];

export default socials;
