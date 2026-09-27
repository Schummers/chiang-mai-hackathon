import type { InfoCard } from "@/lib/engine/types";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** The model's context cards, kept only when they have a heading and a body; at most 2. */
export function infoCards(value: unknown): InfoCard[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((c: Record<string, unknown> | null) => ({
      heading: str(c?.heading, 60),
      headingThai: str(c?.headingThai, 60),
      body: str(c?.body, 320),
      suggestion: str(c?.suggestion, 140),
    }))
    .filter((c) => c.heading && c.body)
    .slice(0, 2)
    .map(({ heading, headingThai, body, suggestion }) => ({
      heading,
      body,
      ...(headingThai && { headingThai }),
      ...(suggestion && { suggestion }),
    }));
}
