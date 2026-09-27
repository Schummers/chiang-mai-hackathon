"use client";

import { ArrowLeft, ArrowRight, Languages as LanguagesIcon, Mic, Square } from "lucide-react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Languages, Side } from "@/lib/engine/types";
import { findLanguage } from "@/lib/language";
import { Wave } from "./Wave";
import d from "./Dock.module.css";

type Props = {
  state: ConversationState;
  onTap: (side: Side) => void;
  languages: Languages;
  /** Message being read aloud: the hand-off hint waits for the owner's message to finish playing. */
  playingId: string | null;
  getLevel: () => number;
  /** Offline: both mics are disabled. */
  offline?: boolean;
};

/** K1 floating dock: the other person's mic left, the owner's right, the middle narrates the state. */
export function Dock({ state, onTap, languages, playingId, getLevel, offline = false }: Props) {
  const { phase, messages } = state;
  const last = messages[messages.length - 1];
  const handoff = phase.kind === "idle" && last && !(last.side === "me" && playingId === last.id) ? phase.nextTurn : null;

  const mic = (side: Side) => {
    const language = findLanguage(languages[side]);
    const recording = phase.kind === "listening" && phase.side === side;
    const disabled = offline || phase.kind === "processing" || (phase.kind === "listening" && !recording);
    // Whose turn it is: after a message, and after "didn't catch that" for the one who has to speak again.
    const pulse =
      (phase.kind === "idle" && phase.nextTurn === side && messages.length > 0) ||
      (phase.kind === "error" && phase.reason === "empty" && phase.side === side);
    return (
      <button
        className={`${d.mic} ${side === "me" ? d.you : d.them} ${recording ? d.stop : ""} ${pulse ? d.pulse : ""}`}
        disabled={disabled}
        onClick={() => onTap(side)}
        aria-pressed={recording}
        lang={language.code}
      >
        {recording ? <Square size={22} strokeWidth={2.1} fill="currentColor" /> : <Mic size={24} strokeWidth={2.1} />}
        <span className={d.verb}>{recording ? language.stop : language.verb}</span>
      </button>
    );
  };

  let middle: React.ReactNode = null;
  if (phase.kind === "listening") {
    middle = (
      <span className={`${d.state} ${phase.side === "them" ? d.themText : d.youText}`}>
        <Wave startedAt={phase.startedAt} getLevel={getLevel} bars={7} className={d.wave} timeClassName={d.time} />
      </span>
    );
  } else if (phase.kind === "processing") {
    middle = (
      <span className={d.state} lang={languages[phase.side]}>
        <LanguagesIcon size={18} strokeWidth={2.1} /> {findLanguage(languages[phase.side]).translating}
      </span>
    );
  } else if (handoff) {
    const language = findLanguage(languages[handoff]);
    middle = (
      <span className={`${d.state} ${handoff === "them" ? d.themText : d.youText} ${d.handoff}`} lang={language.code}>
        {handoff === "them" && <ArrowLeft size={18} strokeWidth={2.4} />} {language.turn}{" "}
        {handoff === "me" && <ArrowRight size={18} strokeWidth={2.4} />}
      </span>
    );
  }

  return (
    <footer className={d.dock}>
      {mic("them")}
      <div className={d.middle} aria-live="polite">
        {middle}
      </div>
      {mic("me")}
    </footer>
  );
}
