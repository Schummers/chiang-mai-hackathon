import type { Message, Speaker } from "@/lib/engine/types";
import s from "./Chat.module.css";

const THAI = /[฀-๿]/;

/** One item is plain text, two or more become bullets. Thai text gets the Thai type style. */
export function Items({ items, className }: { items: string[]; className: string }) {
  const thai = items.some((t) => THAI.test(t));
  const cls = `${className} ${thai ? s.thai : ""}`;
  if (items.length < 2) return <p className={cls}>{items[0]}</p>;
  return (
    <ul className={cls}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Row({ speaker, children }: { speaker: Speaker; children: React.ReactNode }) {
  return <div className={`${s.row} ${speaker === "you" ? s.you : s.them}`}>{children}</div>;
}

/** Big = translation (what the reader of this bubble reads), small = original (what was said). */
export function Bubble({ message }: { message: Message }) {
  return (
    <Row speaker={message.speaker}>
      <div className={`${s.bubble} ${s.enter}`}>
        <Items items={message.translation} className={s.big} />
        <Items items={message.original} className={s.small} />
      </div>
    </Row>
  );
}
