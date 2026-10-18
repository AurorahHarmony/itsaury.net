// Ways to support me, shown in the support box under each post and in the
// footer. Add a method here and it appears everywhere the box is used.
export interface SupportMethod {
  name: string;
  /** File name in /icons, without the extension */
  icon: string;
  /** Opens in a new tab, e.g. a Ko-fi or Patreon page */
  url?: string;
  /** Copied to the clipboard instead, e.g. a crypto wallet address */
  copy?: string;
  /** Short line under the name, e.g. the network a wallet is on */
  note?: string;
}

export default {
  heading: "Enjoyed this?",
  blurb: "If something here helped you out or made you smile, a tip helps keep the projects coming.",
  methods: [
    { name: "Ko-fi", icon: "cup-hot-fill", url: "https://ko-fi.com/aurorahHarmony" },
  ] as SupportMethod[],
};
