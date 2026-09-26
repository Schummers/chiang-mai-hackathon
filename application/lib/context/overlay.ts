import type { Allergy } from "@/lib/engine/types";

/**
 * Hand-written facts the pack does not hold as fields: main meat, spice and allergy risks.
 * Only for dishes likely in the demo; the model fills meat and spice for the others.
 * Allergens are "may contain" risks read from the pack's ingredients and descriptions.
 */
export type DishOverlay = {
  meat?: string;
  spice?: 0 | 1 | 2 | 3;
  allergens?: Exclude<Allergy, "other">[];
  localDetail?: string;
};

export const DISH_OVERLAY: Record<string, DishOverlay> = {
  "khao-soi": {
    meat: "Chicken or beef",
    spice: 1,
    allergens: ["gluten"],
    localDetail: "Often linked to Chinese Muslim cooks; locals add lime, shallots and pickled greens to taste.",
  },
  "sai-ua": {
    meat: "Pork",
    spice: 2,
    localDetail: "A Chiang Mai souvenir: ask for a vacuum-packed one to take on a flight.",
  },
  "nam-phrik-num": {
    meat: "None",
    spice: 3,
    localDetail: "Eaten with sticky rice, pork crackling (khaep mu) and vegetables.",
  },
  "nam-phrik-ong": {
    meat: "Pork",
    spice: 1,
    allergens: ["shellfish"],
    localDetail: "A mild tomato and pork dip, eaten with fresh vegetables and pork crackling.",
  },
  "kaeng-hang-le": {
    meat: "Pork belly",
    spice: 1,
    allergens: ["peanuts"],
    localDetail: "Named after the Burmese \"hin lay\"; cooked for festivals, merit-making and weddings.",
  },
  "kaeng-khae": {
    meat: "Chicken or other",
    spice: 2,
    localDetail: "A jungle curry without coconut milk; the vegetables change with the season.",
  },
  "larb-mueang": {
    meat: "Pork, blood, offal",
    spice: 2,
    localDetail: "Northern larb is dry and spiced with makhwaen, not sour like the Isan version.",
  },
  "khanom-chin-nam-ngiao": {
    meat: "Pork ribs, blood cake",
    spice: 1,
    localDetail: "Rice noodles in a tomato and pork broth, thickened with fermented soybean (thua nao).",
  },
  "khaep-mu": {
    meat: "Pork skin",
    spice: 0,
    localDetail: "The crunch that goes with nam phrik num.",
  },
  "tam-khanun": {
    meat: "Pork",
    spice: 2,
    allergens: ["shellfish"],
    localDetail: "Young jackfruit pounded with chilli paste: a festival and wedding dish.",
  },
};
