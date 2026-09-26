import type { Message } from "./engine/types";

export type SayItRow = { thai: string; roman: string | null; meaning: string | null };

/**
 * Say it yourself, one row per Thai item. Phonetics and meaning line up by index; an item without one gets no line
 * (never merged: a phonetic line under the wrong Thai teaches the wrong sentence).
 */
export function sayItRows(message: Message): SayItRow[] {
  const roman = message.romanised ?? [];
  return message.translation.map((thai, i) => ({
    thai,
    roman: roman[i] || null,
    meaning: message.original[i] || null,
  }));
}
