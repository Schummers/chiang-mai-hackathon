"use client";

import { Mic } from "lucide-react";
import type { Speaker } from "@/lib/engine/types";
import { Row } from "./Bubble";
import { Wave } from "./Wave";
import s from "./ListeningCard.module.css";

type Props = {
  speaker: Speaker;
  startedAt: number;
  /** Returns the live mic level, 0 to 1. */
  getLevel: () => number;
  label: string;
};

export function ListeningCard({ speaker, startedAt, getLevel, label }: Props) {
  return (
    <Row speaker={speaker}>
      <div className={`${s.card} ${speaker === "you" ? s.you : s.them}`} lang={speaker === "vendor" ? "th" : undefined}>
        <span className={s.dot}>
          <Mic size={18} strokeWidth={2.1} />
        </span>
        <span className={s.label}>{label}</span>
        <Wave startedAt={startedAt} getLevel={getLevel} className={s.wave} timeClassName={s.time} />
      </div>
    </Row>
  );
}
