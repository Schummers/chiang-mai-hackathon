import type { MoveCard, MoveType } from "./engine/types";

const LABEL: Record<MoveType, string> = { say: "Say it", ask: "Ask", echo: "Echo" };

export type MoveLines = {
  label: string;
  /** Echo only: "ซาว = 20", the Vendor's word and what it meant. */
  heard: string | null;
  /** Kham Mueang when the Move has it, else Central Thai. */
  big: string;
  /** Central Thai under Kham Mueang, the fallback for vendors who don't speak it. */
  small: string | null;
  /** Romanised of the big line. */
  roman: string;
  english: string;
  /** What the phone voice reads: the big line (the voice reads Thai script, Kham Mueang included). */
  speak: string;
};

/** What a Move card shows, line by line. The component only lays these out. */
export function moveLines(card: MoveCard): MoveLines {
  const km = card.khamMueang;
  const echo = card.type === "echo";
  return {
    label: LABEL[card.type],
    heard: echo && card.heard ? (card.heardMeaning ? `${card.heard} = ${card.heardMeaning}` : card.heard) : null,
    big: km ?? card.centralThai,
    small: km ? card.centralThai : null,
    roman: (km && card.romanised.khamMueang) || card.romanised.central,
    english: card.english,
    speak: km ?? card.centralThai,
  };
}
