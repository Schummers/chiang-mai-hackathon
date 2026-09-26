"use client";

import { BookOpen, Check, Drumstick, MapPin, OctagonX, Soup } from "lucide-react";
import { cardFlags } from "@/lib/cardFlag";
import type { ContextCard as Card } from "@/lib/engine/types";
import { useMyInfo } from "@/lib/useMyInfo";
import s from "./ContextCard.module.css";

const SPICE_LABELS = ["Not spicy", "Mild", "Medium", "Hot"];

function Label({ card }: { card: Card }) {
  if (card.kind === "word")
    return (
      <>
        <BookOpen size={14} strokeWidth={2.1} /> Local word
      </>
    );
  if (card.kind === "moment")
    return (
      <>
        <MapPin size={14} strokeWidth={2.1} /> Today in Chiang Mai
      </>
    );
  return (
    <>
      <Soup size={14} strokeWidth={2.1} /> {card.offGuide ? "Dish · not in our guide" : "Special dish"}
    </>
  );
}

/** L2w context card (C2): the only thing framed by the weave, it belongs to both voices. `vendorSaid` is the reply it came with. */
export function ContextCard({ card, vendorSaid = [] }: { card: Card; vendorSaid?: string[] }) {
  const myInfo = useMyInfo();
  const { flag, vendorNo } = cardFlags(card, myInfo, vendorSaid);
  const facts = card.meat || card.spice !== undefined || vendorNo.length > 0;

  return (
    <article className={s.frame}>
      <div className={`${s.card} ${flag ? s.conflict : ""}`}>
        <p className={s.kicker}>
          <Label card={card} />
        </p>
        <h3 className={s.name}>
          {card.name} {card.nameThai && <span className={s.thai}>{card.nameThai}</span>}
        </h3>
        <p className={s.desc}>{card.description}</p>

        {facts && (
          <div className={s.facts}>
            {card.meat && (
              <span>
                <Drumstick size={16} strokeWidth={2.1} /> {card.meat}
              </span>
            )}
            {card.spice !== undefined && (
              <span>
                <span className={s.heat} aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <b key={n} className={n <= (card.spice ?? 0) ? s.on : ""} />
                  ))}
                </span>
                {SPICE_LABELS[card.spice]}
              </span>
            )}
            {vendorNo.map((a) => (
              <span key={a}>
                <Check size={16} strokeWidth={2.4} /> Vendor: no {a}
              </span>
            ))}
          </div>
        )}

        {card.localDetail && (
          <p className={s.local}>
            <MapPin size={14} strokeWidth={2.1} /> {card.localDetail}
          </p>
        )}

        {flag && (
          <p className={s.flag} role="note">
            <OctagonX size={18} strokeWidth={2.1} /> {flag}
          </p>
        )}
      </div>
    </article>
  );
}
