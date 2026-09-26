"use client";

import { Languages } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Message } from "@/lib/engine/types";
import { Bubble, Row } from "./Bubble";
import { ErrorState } from "./ErrorState";
import { LogoMark } from "./Logo";
import s from "./Chat.module.css";
import screen from "./Screen.module.css";

type Props = {
  state: ConversationState;
  /** Shown under the greeting on an empty conversation (About you card). */
  intro?: React.ReactNode;
  /** Live content at the end of the thread (Listening card). */
  live?: React.ReactNode;
  playingId: string | null;
  onSpeak: (message: Message) => void;
  onRetry: () => void;
  onDismissError: () => void;
};

export function ChatThread({ state, intro, live, playingId, onSpeak, onRetry, onDismissError }: Props) {
  const { phase, messages } = state;
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
          <p className={screen.brand}>Don&apos;t just order. Make the vendor smile.</p>
          <b>Say what&apos;s on your mind.</b>
          <span>We&apos;ll turn it into clear Thai.</span>
          {/* Hint wording is a draft, final call is Jonathan's (ticket 03). */}
          <p className={screen.hint}>Ramble, hesitate, change your mind. We keep what you mean.</p>
        </div>
      )}
      {empty && intro}

      {messages.map((m) => (
        <Bubble key={m.id} message={m} playing={playingId === m.id} onSpeak={() => onSpeak(m)} />
      ))}

      {live}

      {phase.kind === "processing" && (
        <Row speaker={phase.speaker}>
          <div className={s.proc}>
            <div>
              <p className={s.raw}>{phase.raw ?? (phase.speaker === "you" ? "Transcribing…" : "กำลังถอดเสียง…")}</p>
              {phase.raw && (
                <p className={s.status} lang={phase.speaker === "vendor" ? "th" : undefined}>
                  <Languages size={14} strokeWidth={2.1} />
                  {phase.speaker === "you" ? "Cleaning up and translating…" : "กำลังแปล…"}
                </p>
              )}
            </div>
          </div>
        </Row>
      )}

      {phase.kind === "error" && <ErrorState phase={phase} onRetry={onRetry} onDismiss={onDismissError} />}
    </section>
  );
}
