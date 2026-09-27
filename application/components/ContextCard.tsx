"use client";

import { Lightbulb, MessageSquareReply } from "lucide-react";
import type { ContextCard as Card } from "@/lib/engine/types";
import chat from "./Chat.module.css";
import s from "./ContextCard.module.css";

/** Written by the model under a Turn: a heading, two sentences, and a follow-up the owner sends in one tap. */
export function ContextCard({ card, onSuggest, busy }: { card: Card; onSuggest?: (text: string) => void; busy?: boolean }) {
  return (
    <article className={s.frame}>
      <div className={s.card}>
        <p className={s.kicker}>
          <Lightbulb size={14} strokeWidth={2.1} aria-hidden /> Context
        </p>
        <h3 className={s.name}>
          {card.heading} {card.headingThai && <span className={s.thai}>{card.headingThai}</span>}
        </h3>
        <p className={s.desc}>{card.body}</p>
        {card.suggestion && onSuggest && (
          <button type="button" className={`${chat.tool} ${s.suggest}`} disabled={busy} onClick={() => onSuggest(card.suggestion!)}>
            <MessageSquareReply size={16} strokeWidth={2.1} aria-hidden />
            <span>
              <span className={s.label}>Suggested:</span> “{card.suggestion}”
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
