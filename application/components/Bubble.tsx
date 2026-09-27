import { Ear } from "lucide-react";
import type { Message, Side } from "@/lib/engine/types";
import { ContextCard } from "./ContextCard";
import { PlayTool } from "./PlayTool";
import s from "./Chat.module.css";

const THAI = /[฀-๿]/;
const thai = (text: string) => (THAI.test(text) ? s.thai : "");

/** Loose comparison, so a correction that only changed spacing or punctuation doesn't show as one. */
const squash = (text: string) => text.toLowerCase().replace(/[\s.,!?'"“”‘’…]/g, "");

export function Row({ side, children }: { side: Side; children: React.ReactNode }) {
  return <div className={`${s.row} ${side === "me" ? s.you : s.them}`}>{children}</div>;
}

/** L1 voice card. Big = translation (what the listener reads), small = what was said, corrected. Tap anywhere to play. */
export function Bubble({
  message,
  playing,
  onSpeak,
  onSuggest,
  busy = false,
}: {
  message: Message;
  playing: boolean;
  onSpeak: () => void;
  /** Sends a context card's suggestion as the owner's next message. */
  onSuggest?: (text: string) => void;
  /** A Turn is in progress: suggestions wait. */
  busy?: boolean;
}) {
  const corrected = squash(message.heard) !== squash(message.original);
  return (
    <>
      <Row side={message.side}>
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
          <p className={`${s.big} ${thai(message.translation)}`}>{message.translation}</p>
          <p className={`${s.small} ${thai(message.original)}`}>{message.original}</p>
          {corrected && (
            <p className={`${s.heard} ${thai(message.heard)}`} title="What the microphone heard, before correction">
              <Ear size={12} strokeWidth={2.1} aria-label="Heard" /> {message.heard}
            </p>
          )}
          {/* The owner's message was already read aloud once, for the other person. */}
          <PlayTool playing={playing} again={message.side === "me"} />
        </div>
      </Row>
      {message.cards.map((card, i) => (
        <ContextCard key={i} card={card} onSuggest={onSuggest} busy={busy} />
      ))}
    </>
  );
}
