"use client";

import { Apple, ClipboardList, Mic, OctagonX, Signpost, Soup } from "lucide-react";
import type { PhotoCard as Card } from "@/lib/engine/types";
import { menuRows, readablePhotoCard, UNREADABLE_TITLE } from "@/lib/photoCard";
import { useMyInfo } from "@/lib/useMyInfo";
import { ContextCard } from "./ContextCard";
import c from "./ContextCard.module.css";
import s from "./PhotoCard.module.css";

/** "Ask about this photo", Play style. Wired in ticket 05. */
function AskTool({ onAsk }: { onAsk?: () => void }) {
  return (
    <button type="button" className={s.ask} onClick={onAsk}>
      <Mic size={16} strokeWidth={2.1} /> Ask about this photo
    </button>
  );
}

/** The woven card that answers a photo: menu, dish, fruit / ingredient or sign. */
export function PhotoCard({ card: read, onAsk }: { card: Card; onAsk?: () => void }) {
  const myInfo = useMyInfo();
  const card = readablePhotoCard(read);

  if (card.kind === "dish") {
    return (
      <ContextCard
        card={{ kind: "dish", name: card.title, nameThai: card.titleThai, description: card.description, meat: card.meat, spice: card.spice, localDetail: card.localDetail, warning: card.warning }}
        kicker={
          <>
            <Soup size={14} strokeWidth={2.1} /> Dish
          </>
        }
      >
        <AskTool onAsk={onAsk} />
      </ContextCard>
    );
  }

  let kicker: React.ReactNode;
  let body: React.ReactNode;
  if (card.kind === "menu") {
    const { rows, more } = menuRows(card, myInfo);
    const n = card.items?.length ?? 0;
    kicker = (
      <>
        <ClipboardList size={14} strokeWidth={2.1} /> Menu · {n} {n === 1 ? "dish" : "dishes"}
      </>
    );
    body = (
      <ul className={s.menu}>
        {rows.map((row, i) => (
          <li key={i} className={s.row}>
            <span className={s.dish}>
              <b>{row.name}</b> {row.nameThai && <span className={s.thai}>{row.nameThai}</span>}
            </span>
            {row.pill &&
              (row.pill.conflict ? (
                <span className={`${s.pill} ${s.conflict}`}>
                  <OctagonX size={12} strokeWidth={2.6} /> {row.pill.label}
                </span>
              ) : (
                <span className={s.pill}>{row.pill.label}</span>
              ))}
          </li>
        ))}
        {more > 0 && <li className={`${s.row} ${s.more}`}>+ {more} more</li>}
      </ul>
    );
  } else {
    const sign = card.kind === "sign";
    const quoted = sign && card.title !== UNREADABLE_TITLE;
    kicker = sign ? (
      <>
        <Signpost size={14} strokeWidth={2.1} /> Sign
      </>
    ) : (
      <>
        <Apple size={14} strokeWidth={2.1} /> Fruit / ingredient
      </>
    );
    body = (
      <>
        <h3 className={c.name}>
          {quoted ? `“${card.title}”` : card.title} {card.titleThai && <span className={c.thai}>{card.titleThai}</span>}
        </h3>
        <p className={c.desc}>{card.description}</p>
        {card.localDetail && <p className={c.local}>{card.localDetail}</p>}
      </>
    );
  }

  return (
    <article className={c.frame}>
      <div className={c.card}>
        <p className={c.kicker}>{kicker}</p>
        {body}
        <AskTool onAsk={onAsk} />
      </div>
    </article>
  );
}
