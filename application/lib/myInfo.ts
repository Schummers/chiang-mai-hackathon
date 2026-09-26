import { EMPTY_MY_INFO, type Allergy, type Diet, type MyInfo, type Particle, type Spice } from "./engine/types";
import { browserStorage } from "./storage";

const KEY = "u-mueang:my-info";

export const ALLERGIES: { value: Allergy; label: string }[] = [
  { value: "peanuts", label: "Peanut allergy" },
  { value: "shellfish", label: "Shellfish allergy" },
  { value: "gluten", label: "Gluten allergy" },
  { value: "other", label: "Other allergy" },
];

export const SPICES: { value: Spice; label: string }[] = [
  { value: "none", label: "No spice" },
  { value: "mild", label: "Mild spice" },
  { value: "thai-hot", label: "Thai hot" },
];

export const DIETS: { value: Diet; label: string }[] = [
  { value: "no-pork", label: "No pork" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "halal", label: "Halal" },
];

/** How the Visitor ends a polite sentence in Moves: ครับ/คับ or ค่ะ/เจ้า. */
export const PARTICLES: { value: Particle; label: string }[] = [
  { value: "m", label: "Man (khrap)" },
  { value: "f", label: "Woman (kha)" },
];

/**
 * The one place a particle is normalised: anything but "f" is "m". Also reads `speaker`, the key's old name
 * (before 2026-09-27), from phones that saved My info then and clients that still send it.
 */
export function particleOf(info: (Partial<MyInfo> & { speaker?: unknown }) | null | undefined): Particle {
  return (info?.particle ?? info?.speaker) === "f" ? "f" : "m";
}

/** Stored on the phone only. Any storage problem means "no info", never a crash. */
export function loadMyInfo(storage = browserStorage()): MyInfo {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return EMPTY_MY_INFO;
    const parsed = JSON.parse(raw) as Partial<MyInfo> & { speaker?: unknown };
    return {
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      spice: parsed.spice ?? null,
      diet: Array.isArray(parsed.diet) ? parsed.diet : [],
      ...(particleOf(parsed) === "f" && { particle: "f" as const }),
    };
  } catch {
    return EMPTY_MY_INFO;
  }
}

export function saveMyInfo(info: MyInfo, storage = browserStorage()) {
  try {
    storage?.setItem(KEY, JSON.stringify(info));
  } catch {
    // Private mode or blocked storage: keep it for this session only.
  }
}

const union = <T,>(a: T[], b: T[] = []) => [...a, ...b.filter((x) => !a.includes(x))];

/** Adds info detected in speech ("I'm allergic to peanuts") to what the visitor already set. */
export function mergeMyInfo(current: MyInfo, detected: Partial<MyInfo>): { info: MyInfo; changed: boolean } {
  const info: MyInfo = {
    allergies: union(current.allergies, detected.allergies),
    spice: detected.spice ?? current.spice,
    diet: union(current.diet, detected.diet),
    ...(current.particle && { particle: current.particle }),
  };
  return { info, changed: JSON.stringify(info) !== JSON.stringify(current) };
}

export function chipLabels(info: MyInfo): string[] {
  return [
    ...ALLERGIES.filter((a) => info.allergies.includes(a.value)).map((a) => a.label),
    ...SPICES.filter((s) => s.value === info.spice).map((s) => s.label),
    ...DIETS.filter((d) => info.diet.includes(d.value)).map((d) => d.label),
  ];
}
