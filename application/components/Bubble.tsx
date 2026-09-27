import type { Message, Speaker } from "@/lib/engine/types";
import { ContextCard } from "./ContextCard";
import { InfoCard } from "./InfoCard";
import { MoveCard } from "./MoveCard";
import { PlayTool } from "./PlayTool";
import { SayItTool } from "./SayItYourself";
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
/** `latest`: the last Turn of the thread; an older Turn's Move card collapses to one line. `recording`: a mic is listening. */
export function Bubble({
  message,
  playing,
  onSpeak,
  latest = true,
  recording = false,
  onSuggest,
  busy = false,
}: {
  message: Message;
  playing: boolean;
  onSpeak: () => void;
  latest?: boolean;
  recording?: boolean;
  /** Sends a context card's suggestion as your next message. */
  onSuggest?: (text: string) => void;
  /** A Turn is in progress: suggestions wait. */
  busy?: boolean;
}) {
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
            <div className={s.tools}>
              <PlayTool playing={playing} again />
              <SayItTool message={message} recording={recording} />
            </div>
          ) : (
            <PlayTool playing={playing} again={false} />
          )}
        </div>
      </Row>
      {message.card && <ContextCard card={message.card} vendorSaid={message.speaker === "vendor" ? message.translation : []} />}
      {message.cards?.map((card, i) => <InfoCard key={i} card={card} onSuggest={onSuggest} busy={busy} />)}
      {/* The Allergy Flag wins: a Turn shows the flag or a Move, never both. */}
      {!message.card && message.move && <MoveCard card={message.move} collapsed={!latest} />}
    </>
  );
}
