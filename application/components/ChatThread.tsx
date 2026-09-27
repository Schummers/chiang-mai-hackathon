"use client";

import { Languages as LanguagesIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Languages, Message } from "@/lib/engine/types";
import { findLanguage } from "@/lib/language";
import { HOME } from "@/lib/pitch";
import { Bubble, Row } from "./Bubble";
import { ErrorState } from "./ErrorState";
import { LogoMark } from "./Logo";
import s from "./Chat.module.css";
import screen from "./Screen.module.css";

type Props = {
  state: ConversationState;
  languages: Languages;
  /** Shown under the greeting on an empty conversation (About you card). */
  intro?: React.ReactNode;
  /** Live content at the end of the thread (Listening card). */
  live?: React.ReactNode;
  playingId: string | null;
  onSpeak: (message: Message) => void;
  onRetry: () => void;
  onDismissError: () => void;
  /** The suggestion on a context card, sent as the owner's next message. */
  onSuggest?: (text: string) => void;
};

export function ChatThread({ state, languages, intro, live, playingId, onSpeak, onRetry, onDismissError, onSuggest }: Props) {
  const { phase, messages } = state;
  const busy = phase.kind !== "idle" && phase.kind !== "error";
  const ref = useRef<HTMLElement>(null);
  const empty = messages.length === 0 && phase.kind === "idle";

  // Follow the latest content; the user can still scroll up to re-read.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, phase]);

  return (
    <section ref={ref} className={screen.chat} aria-live="polite">
      {empty && (
        <div className={screen.hello}>
          <LogoMark size={56} />
          <b>{HOME.title}</b>
          <span>{HOME.subtitle}</span>
        </div>
      )}
      {empty && intro}

      {messages.map((m) => (
        <Bubble key={m.id} message={m} playing={playingId === m.id} onSpeak={() => onSpeak(m)} onSuggest={onSuggest} busy={busy} />
      ))}

      {live}

      {phase.kind === "processing" && (
        <Row side={phase.side}>
          <div className={s.proc}>
            <div>
              <p className={s.raw}>{phase.heard}</p>
              <p className={s.status} lang={languages[phase.side]}>
                <LanguagesIcon size={14} strokeWidth={2.1} />
                {findLanguage(languages[phase.side]).translating}
              </p>
            </div>
          </div>
        </Row>
      )}

      {phase.kind === "error" && <ErrorState phase={phase} language={languages[phase.side]} onRetry={onRetry} onDismiss={onDismissError} />}
    </section>
  );
}
