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

export const PARTICLES: { value: Particle; label: string }[] = [
  { value: "m", label: "Man (khrap)" },
  { value: "f", label: "Woman (kha)" },
];

export const particleOf = (info: Partial<MyInfo> | null | undefined): Particle => (info?.particle === "f" ? "f" : "m");

export const NOTES_MAX = 1000;

const pick = <T extends string>(values: unknown, allowed: { value: T }[]): T[] =>
  Array.isArray(values) ? values.filter((v): v is T => allowed.some((a) => a.value === v)) : [];

/** Stored on the phone only. Any storage problem means "no info", never a crash. */
export function loadMyInfo(storage = browserStorage()): MyInfo {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return EMPTY_MY_INFO;
    return sanitizeMyInfo(JSON.parse(raw));
  } catch {
    return EMPTY_MY_INFO;
  }
}

/** Keeps only known values; used on load and on the server for whatever the client sent. */
export function sanitizeMyInfo(value: unknown): MyInfo {
  const v = (value ?? {}) as Partial<Record<keyof MyInfo, unknown>>;
  const spice = SPICES.find((s) => s.value === v.spice)?.value ?? null;
  return {
    allergies: pick(v.allergies, ALLERGIES),
    spice,
    diet: pick(v.diet, DIETS),
    ...(v.particle === "f" && { particle: "f" as const }),
    ...(typeof v.notes === "string" && v.notes.trim() && { notes: v.notes.slice(0, NOTES_MAX) }),
  };
}

export function saveMyInfo(info: MyInfo, storage = browserStorage()) {
  try {
    storage?.setItem(KEY, JSON.stringify(info));
  } catch {
    // Private mode or blocked storage: keep it for this session only.
  }
}
