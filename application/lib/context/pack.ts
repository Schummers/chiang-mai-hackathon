import packJson from "./pack.json";

/** Luke's Lanna context pack, filtered to Trusted entries by scripts/build-pack.mjs. */
export type Pack = typeof packJson;
export type PackDish = Pack["dishes"][number];
export type PackProduce = Pack["produce"][number];
export type PackWord = Pack["words"][number];
export type PackFalseFriend = Pack["falseFriends"][number];
export type PackFestival = Pack["festivals"][number];

export const PACK: Pack = packJson;
