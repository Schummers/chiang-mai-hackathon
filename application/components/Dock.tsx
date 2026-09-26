"use client";

import { ArrowLeft, ArrowRight, Languages, Mic, Square } from "lucide-react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Speaker, UserLanguage } from "@/lib/engine/types";
import { findLanguage } from "@/lib/language";
import { Wave } from "./Wave";
import d from "./Dock.module.css";

type Props = {
  state: ConversationState;
  onTap: (speaker: Speaker) => void;
  /** Drives your verb only; the picker lives in About you. */
  language: UserLanguage;
  /** Message being read aloud: the hand-off hint waits for your Thai to finish playing. */
  playingId: string | null;
  getLevel: () => number;
  /** Offline: both mics are disabled. */
  offline?: boolean;
};

/** K1 floating dock: vendor square left, yours right, the middle narrates the state (K3 / K4 / K5). */
export function Dock({ state, onTap, language, playingId, getLevel, offline = false }: Props) {
  const { phase, messages } = state;
  const { verb: yourVerb, stop: yourStop } = findLanguage(language);
  const last = messages[messages.length - 1];

  // Hand-off: after your Thai has played (or right away if audio is blocked), and after the vendor's reply.
  const handoff =
    phase.kind === "idle" && last && !(last.speaker === "you" && playingId === last.id) ? phase.nextTurn : null;

  const mic = (speaker: Speaker) => {
    const recording = phase.kind === "listening" && phase.speaker === speaker;
    const disabled = offline || phase.kind === "processing" || (phase.kind === "listening" && !recording);
    // Whose turn it is: after a message, and after "didn't catch that" for the one who has to speak again.
    const pulse =
      (phase.kind === "idle" && phase.nextTurn === speaker && messages.length > 0) ||
      (phase.kind === "error" && phase.reason === "empty" && phase.speaker === speaker);
    const vendor = speaker === "vendor";
    return (
      <button
        className={`${d.mic} ${vendor ? d.them : d.you} ${recording ? d.stop : ""} ${pulse ? d.pulse : ""}`}
        disabled={disabled}
        onClick={() => onTap(speaker)}
        aria-pressed={recording}
        lang={vendor ? "th" : language}
      >
        {recording ? <Square size={22} strokeWidth={2.1} fill="currentColor" /> : <Mic size={24} strokeWidth={2.1} />}
        <span className={d.verb}>{recording ? (vendor ? "หยุด" : yourStop) : vendor ? "พูด" : yourVerb}</span>
      </button>
    );
  };

  let middle: React.ReactNode = null;
  if (phase.kind === "listening") {
    middle = (
      <span className={`${d.state} ${phase.speaker === "vendor" ? d.themText : d.youText}`}>
        <Wave startedAt={phase.startedAt} getLevel={getLevel} bars={7} className={d.wave} timeClassName={d.time} />
      </span>
    );
  } else if (phase.kind === "processing") {
    middle = (
      <span className={d.state}>
        <Languages size={18} strokeWidth={2.1} /> Translating…
      </span>
    );
  } else if (handoff === "vendor") {
    middle = (
      <span className={`${d.state} ${d.themText} ${d.handoff}`} lang="th">
        <ArrowLeft size={18} strokeWidth={2.4} /> ตาคุณ
      </span>
    );
  } else if (handoff === "you") {
    middle = (
      <span className={`${d.state} ${d.youText} ${d.handoff}`}>
        Your turn <ArrowRight size={18} strokeWidth={2.4} />
      </span>
    );
  }

  return (
    <footer className={d.dock}>
      {mic("vendor")}
      <div className={d.middle} aria-live="polite">
        {middle}
      </div>
      {mic("you")}
    </footer>
  );
}
