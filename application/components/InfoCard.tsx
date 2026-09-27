"use client";

import { Lightbulb, MessageSquareReply } from "lucide-react";
import type { InfoCard as Card } from "@/lib/engine/types";
import chat from "./Chat.module.css";
import frame from "./ContextCard.module.css";
import s from "./InfoCard.module.css";

/** Context card written by the model under a Turn: a heading, two sentences, and a follow-up to send in one tap. */
export function InfoCard({ card, onSuggest, busy }: { card: Card; onSuggest?: (text: string) => void; busy?: boolean }) {
  return (
    <article className={frame.frame}>
      <div className={frame.card}>
        <p className={frame.kicker}>
          <Lightbulb size={14} strokeWidth={2.1} aria-hidden /> Context
        </p>
        <h3 className={frame.name}>
          {card.heading} {card.headingThai && <span className={frame.thai}>{card.headingThai}</span>}
        </h3>
        <p className={frame.desc}>{card.body}</p>
        {card.suggestion && onSuggest && (
          <button type="button" className={`${chat.tool} ${s.suggest}`} disabled={busy} onClick={() => onSuggest(card.suggestion!)}>
            <MessageSquareReply size={16} strokeWidth={2.1} aria-hidden />
            <span>
              <span className={s.label}>Ask</span> “{card.suggestion}”
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
