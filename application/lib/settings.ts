import { browserStorage } from "./storage";

const KEY = "u-mueang:settings";

/** Feature switches, all on by default. Each one decides what goes into the translation prompt. */
export type Settings = {
  /** Your notes from About you. */
  notes: boolean;
  /** GPS + nearby food places from Google Maps. */
  location: boolean;
  /** Local date and time. */
  time: boolean;
  /** Northern Thai Context Pack (dishes, produce, Kham Mueang words). */
  pack: boolean;
  /** Context cards written by the model. */
  cards: boolean;
  /** Move cards (Say it, Ask, Echo). */
  moves: boolean;
};

export const DEFAULT_SETTINGS: Settings = { notes: true, location: true, time: true, pack: true, cards: true, moves: true };

export const SETTING_ROWS: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "notes", label: "Your notes", hint: "Sends the notes from About you with every message." },
  { key: "location", label: "Nearby places", hint: "Uses your location to find food places around you on Google Maps." },
  { key: "time", label: "Date and time", hint: "Morning market or night market: helps guess what is on sale." },
  { key: "pack", label: "Northern Thai guide", hint: "Local dishes, produce in season and Kham Mueang words." },
  { key: "cards", label: "Context cards", hint: "Short explanations under a message, with a follow-up to send." },
  { key: "moves", label: "Phrases to say", hint: "A Thai phrase to say yourself under a message." },
];

export function loadSettings(storage = browserStorage()): Settings {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Record<keyof Settings, unknown>>;
    const out = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (typeof parsed[key] === "boolean") out[key] = parsed[key];
    }
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings, storage = browserStorage()) {
  try {
    storage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Blocked storage: the choice lasts for this session only.
  }
}
