"use client";

import { Languages } from "lucide-react";
import { Fragment, useEffect, useRef } from "react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Message } from "@/lib/engine/types";
import { Bubble, Row } from "./Bubble";
import { ErrorState } from "./ErrorState";
import { LogoMark } from "./Logo";
import { AboutLine, LookingStatus, PhotoAnswer, PhotoQuestion } from "./PhotoAsk";
import { PhotoCard } from "./PhotoCard";
import { PhotoShot } from "./PhotoShot";
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
  /** "Ask about this photo" on a photo card. */
  onAsk?: (photoId: string) => void;
};

export function ChatThread({ state, intro, live, playingId, onSpeak, onRetry, onDismissError, onAsk }: Props) {
  const { phase, messages } = state;
  const ref = useRef<HTMLElement>(null);
  const empty = messages.length === 0 && phase.kind === "idle";
  const photoOf = (id?: string) => (id ? messages.find((m) => m.id === id)?.photo : undefined);
  const asking = phase.kind === "processing" ? photoOf(phase.about) : undefined;

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

      {messages.map((m, i) =>
        m.photo ? (
          <Fragment key={m.id}>
            <PhotoShot url={m.photo.url} read />
            <PhotoCard card={m.photo.card} onAsk={onAsk && (() => onAsk(m.id))} />
          </Fragment>
        ) : m.about ? (
          <Fragment key={m.id}>
            <PhotoQuestion question={m.original[0]} url={photoOf(m.about)?.url ?? ""} />
            {m.answer && photoOf(m.about) && <PhotoAnswer answer={m.answer} card={photoOf(m.about)!.card} url={photoOf(m.about)!.url} />}
          </Fragment>
        ) : (
          <Bubble key={m.id} message={m} playing={playingId === m.id} onSpeak={() => onSpeak(m)} latest={i === messages.length - 1} />
        ),
      )}

      {phase.kind === "reading" && <PhotoShot key={phase.photo.id} url={phase.photo.url} read={false} />}
      {phase.kind === "error" && phase.photo && <PhotoShot key={phase.photo.id} url={phase.photo.url} read={false} />}

      {live}

      {phase.kind === "processing" && (
        <Row speaker={phase.speaker}>
          <div className={s.proc}>
            <div>
              {asking && <AboutLine url={asking.url} />}
              <p className={s.raw}>{phase.raw ?? (phase.speaker === "you" ? "Transcribing…" : "กำลังถอดเสียง…")}</p>
              {phase.raw && (
                <p className={s.status} lang={phase.speaker === "vendor" ? "th" : undefined}>
                  {asking ? (
                    <LookingStatus />
                  ) : (
                    <>
                      <Languages size={14} strokeWidth={2.1} />
                      {phase.speaker === "you" ? "Cleaning up and translating…" : "กำลังแปล…"}
                    </>
                  )}
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
