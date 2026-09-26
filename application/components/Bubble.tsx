import type { Message, Speaker } from "@/lib/engine/types";
import { ContextCard } from "./ContextCard";
import { PlayTool } from "./PlayTool";
import s from "./Chat.module.css";

const THAI = /[฀-๿]/;

/** One item is a plain line, two or more become bullets on a shared grid, so Thai and Latin markers align. */
export function Items({ items, className }: { items: string[]; className: string }) {
  const thai = items.some((t) => THAI.test(t));
  const cls = `${className} ${thai ? s.thai : ""}`;
  if (items.length < 2) return <p className={cls}>{items[0]}</p>;
  return (
    <ul className={`${cls} ${s.list}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Row({ speaker, children }: { speaker: Speaker; children: React.ReactNode }) {
  return <div className={`${s.row} ${speaker === "you" ? s.you : s.them}`}>{children}</div>;
}

/** L1 voice card. Big = translation (what the reader of this card reads), small = original. Tap anywhere to play. */
export function Bubble({ message, playing, onSpeak }: { message: Message; playing: boolean; onSpeak: () => void }) {
  const yours = message.speaker === "you";
  return (
    <>
      <Row speaker={message.speaker}>
        <div
          className={`${s.bubble} ${s.enter} ${playing ? s.playing : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={playing}
          onClick={onSpeak}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onSpeak();
          }}
        >
          <Items items={message.translation} className={s.big} />
          <Items items={message.original} className={s.small} />
          {/* Your message was already read aloud once (Thai auto-play), so it offers "Play again". */}
          <PlayTool playing={playing} again={yours} />
        </div>
      </Row>
      {message.card && <ContextCard card={message.card} vendorSaid={message.speaker === "vendor" ? message.translation : []} />}
    </>
  );
}
