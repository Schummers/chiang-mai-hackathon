import type { Speaker } from "@/lib/engine/types";

/** Cleans the model's `romanised` items for Say it yourself. Only the Visitor's Thai gets phonetics. */
export function romanisedItems(value: unknown, speaker: Speaker): string[] | undefined {
  if (speaker !== "you" || !Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean);
  return items.length ? items : undefined;
}
