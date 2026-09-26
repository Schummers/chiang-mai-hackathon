"use client";

import { useEffect, useRef } from "react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Message } from "@/lib/engine/types";
import { Bubble, Row } from "./Bubble";
import s from "./Chat.module.css";
import screen from "./Screen.module.css";

type Props = {
  state: ConversationState;
  /** Shown under the greeting on an empty conversation (My info card). */
  intro?: React.ReactNode;
  /** Live content at the end of the thread (Listening card). */
  live?: React.ReactNode;
  playingId: string | null;
  onSpeak: (message: Message) => void;
};

export function ChatThread({ state, intro, live, playingId, onSpeak }: Props) {
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
          <b>Say what&apos;s on your mind.</b>
          <span>We&apos;ll turn it into clear Thai.</span>
        </div>
      )}
      {empty && intro}

      {messages.map((m) => (
        <Bubble key={m.id} message={m} playing={playingId === m.id} onSpeak={() => onSpeak(m)} />
      ))}

      {live}

      {phase.kind === "processing" && (
        <>
          <Row speaker={phase.speaker}>
            <div className={s.proc}>
              <div>
                <p className={s.raw}>{phase.raw ?? (phase.speaker === "you" ? "Transcribing…" : "กำลังถอดเสียง…")}</p>
              </div>
            </div>
          </Row>
          <p className={s.status} style={{ alignSelf: phase.speaker === "you" ? "flex-end" : "flex-start" }}>
            {phase.speaker === "you" ? "Cleaning up and translating…" : "กำลังแปล…"}
          </p>
        </>
      )}

      {phase.kind === "error" && <p className={s.note}>{errorText(phase.reason)}</p>}
    </section>
  );
}

function errorText(reason: "mic-denied" | "network" | "empty") {
  switch (reason) {
    case "mic-denied":
      return "The microphone is blocked. Allow it in your browser settings, then tap the mic again.";
    case "network":
      return "Connection problem. Tap the mic to try again.";
    case "empty":
      return "We didn't hear anything. Tap the mic and speak a bit closer.";
  }
}
