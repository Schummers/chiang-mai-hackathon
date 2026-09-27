"use client";

import { Mic } from "lucide-react";
import type { Side } from "@/lib/engine/types";
import { Row } from "./Bubble";
import { Wave } from "./Wave";
import s from "./ListeningCard.module.css";

type Props = {
  side: Side;
  startedAt: number;
  /** Returns the live mic level, 0 to 1. */
  getLevel: () => number;
  label: string;
  language: string;
  /** What the browser has heard so far. */
  interim?: string;
};

export function ListeningCard({ side, startedAt, getLevel, label, language, interim }: Props) {
  return (
    <Row side={side}>
      <div className={`${s.card} ${side === "me" ? s.you : s.them} ${interim ? s.stack : ""}`} lang={language}>
        <span className={s.line}>
          <span className={s.dot}>
            <Mic size={18} strokeWidth={2.1} />
          </span>
          <span className={s.label}>{label}</span>
          <Wave startedAt={startedAt} getLevel={getLevel} className={s.wave} timeClassName={s.time} />
        </span>
        {interim && <p className={s.interim}>{interim}</p>}
      </div>
    </Row>
  );
}
