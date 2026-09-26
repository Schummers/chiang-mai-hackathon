"use client";

import { ChevronDown, Mic, Square } from "lucide-react";
import type { ConversationState } from "@/lib/engine/engine";
import type { Speaker, UserLanguage } from "@/lib/engine/types";
import { findLanguage, LANGUAGES } from "@/lib/language";
import a from "./ActionBar.module.css";

type Props = {
  state: ConversationState;
  onTap: (speaker: Speaker) => void;
  language: UserLanguage;
  onLanguage: (code: UserLanguage) => void;
  /** Offline: both mics are disabled. */
  offline?: boolean;
};

export function ActionBar({ state, onTap, language, onLanguage, offline = false }: Props) {
  const { phase, messages } = state;
  const { name, verb: yourVerb, stop: yourStop } = findLanguage(language);
  const busy = phase.kind === "listening" || phase.kind === "processing";

  // A native select laid over the label: the phone's own picker, nothing to build.
  const yourLanguage = (
    <label className={a.picker}>
      {name} <ChevronDown size={14} strokeWidth={2.4} />
      <select
        value={language}
        disabled={busy}
        onChange={(e) => onLanguage(e.target.value)}
        aria-label="Your language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );

  const mic = (speaker: Speaker) => {
    const recording = phase.kind === "listening" && phase.speaker === speaker;
    const disabled = offline || phase.kind === "processing" || (phase.kind === "listening" && !recording);
    // The hint of whose turn it is: after a message, and after "didn't catch that" for the one who has to speak again.
    const pulse =
      (phase.kind === "idle" && phase.nextTurn === speaker && messages.length > 0) ||
      (phase.kind === "error" && phase.reason === "empty" && phase.speaker === speaker);
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
          <span className={a.verb} lang={vendor ? "th" : language}>{recording ? (vendor ? "หยุด" : yourStop) : vendor ? "พูด" : yourVerb}</span>
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
