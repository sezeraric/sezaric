/**
 * Facts that are the same in every language: identity, links, assets.
 * Anything a translator would touch belongs in src/i18n/dictionaries instead.
 */
export const site = {
  name: "Furkan Sezer Ariç",
  handle: "sezeraric",
  email: "furkansezeraric@gmail.com",
  github: "https://github.com/sezeraric",
  // NOTE(sezer): verify this resolves — the Turkish character is percent-encoded.
  linkedin: "https://www.linkedin.com/in/furkan-sezer-ari%C3%A7-7691521b7",
  x: "",
  url: "https://sezaric.com",
  /** Cut-out portrait produced by scripts/cutout.py. */
  portrait: "/me.png",
} as const;
