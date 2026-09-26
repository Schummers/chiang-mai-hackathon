import type { Message, Speaker } from "@/lib/engine/types";
import { ContextCard } from "./ContextCard";
import { MoveCard } from "./MoveCard";
import { PlayTool } from "./PlayTool";
import { SayItTool } from "./SayItYourself";
import s from "./Chat.module.css";
import sayIt from "./SayItYourself.module.css";

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
/** `latest`: the last Turn of the thread; an older Turn's Move card collapses to one line. */
export function Bubble({ message, playing, onSpeak, latest = true }: { message: Message; playing: boolean; onSpeak: () => void; latest?: boolean }) {
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
          {yours ? (
            <div className={sayIt.tools}>
              <PlayTool playing={playing} again />
              <SayItTool message={message} />
            </div>
          ) : (
            <PlayTool playing={playing} again={false} />
          )}
        </div>
      </Row>
      {message.card && <ContextCard card={message.card} vendorSaid={message.speaker === "vendor" ? message.translation : []} />}
      {/* The Allergy Flag wins: a Turn shows the flag or a Move, never both. */}
      {!message.card && message.move && <MoveCard card={message.move} collapsed={!latest} />}
    </>
  );
}
