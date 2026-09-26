"use client";

import { Mic, Square } from "lucide-react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Speaker } from "@/lib/engine/types";
import a from "./ActionBar.module.css";

type Props = {
  state: ConversationState;
  onTap: (speaker: Speaker) => void;
  /** Label under your mic, e.g. "English". */
  yourLanguage: React.ReactNode;
  /** Verb inside your mic, e.g. "Speak", "Parler". */
  yourVerb: string;
  yourStop: string;
};

export function ActionBar({ state, onTap, yourLanguage, yourVerb, yourStop }: Props) {
  const { phase, messages } = state;

  const mic = (speaker: Speaker) => {
    const recording = phase.kind === "listening" && phase.speaker === speaker;
    const disabled = phase.kind === "processing" || (phase.kind === "listening" && !recording);
    const pulse = phase.kind === "idle" && phase.nextTurn === speaker && messages.length > 0;
    const vendor = speaker === "vendor";
    return (
      <div className={`${a.act} ${vendor ? a.them : a.you} ${pulse ? a.pulse : ""}`}>
        <button
          className={a.mic}
          disabled={disabled}
          onClick={() => onTap(speaker)}
          aria-pressed={recording}
          lang={vendor ? "th" : undefined}
        >
          {recording ? <Square size={22} strokeWidth={2.1} fill="currentColor" /> : <Mic size={26} strokeWidth={2.1} />}
          <span className={a.verb}>{recording ? (vendor ? "หยุด" : yourStop) : vendor ? "พูด" : yourVerb}</span>
        </button>
        <div className={a.lang}>{vendor ? "ไทย" : yourLanguage}</div>
      </div>
    );
  };

  return (
    <footer className={a.bar}>
      {mic("vendor")}
      {mic("you")}
    </footer>
  );
}
