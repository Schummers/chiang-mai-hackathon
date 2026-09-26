import { Drumstick, Flame, MapPin, TriangleAlert } from "lucide-react";
import type { ContextCard as Card } from "@/lib/engine/types";
import s from "./ContextCard.module.css";

const SPICE_LABELS = ["Not spicy", "Mild", "Medium", "Hot"];

/** Full-width card in a third style: it belongs to neither voice. */
export function ContextCard({ card }: { card: Card }) {
  return (
    <article className={s.card}>
      <p className={s.kicker}>Context{card.warning ? " · based on your info" : ""}</p>
      <h3 className={s.name}>
        {card.name} {card.nameThai && <span className={s.thai}>{card.nameThai}</span>}
      </h3>
      <p className={s.desc}>{card.description}</p>

      {(card.meat || card.spice !== undefined) && (
        <div className={s.facts}>
          {card.meat && (
            <span>
              <Drumstick size={16} strokeWidth={2.1} /> {card.meat}
            </span>
          )}
          {card.spice !== undefined && (
            <span>
              <Flame size={16} strokeWidth={2.1} />
              <span className={s.heat} aria-hidden>
                {[1, 2, 3].map((n) => (
                  <b key={n} className={n <= (card.spice ?? 0) ? s.on : ""} />
                ))}
              </span>
              {SPICE_LABELS[card.spice]}
            </span>
          )}
        </div>
      )}

      {card.localDetail && (
        <p className={s.local}>
          <MapPin size={16} strokeWidth={2.1} /> {card.localDetail}
        </p>
      )}

      {card.warning && (
        <p className={s.warning}>
          <TriangleAlert size={18} strokeWidth={2.1} /> {card.warning}
        </p>
      )}
    </article>
  );
}
