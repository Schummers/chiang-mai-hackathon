"use client";

import { Plus, UserRound } from "lucide-react";
import type { Speaker } from "@/lib/engine/types";
import { useConversation } from "@/lib/useConversation";
import { ActionBar } from "./ActionBar";
import { ChatThread } from "./ChatThread";
import s from "./Screen.module.css";

/** The one stable screen: top bar, chat, two-mic action bar. */
export function Conversation() {
  const { engine, state } = useConversation({});

  const onTap = (speaker: Speaker) => {
    const { phase } = engine.getState();
    if (phase.kind === "listening" && phase.speaker === speaker) {
      // Temporary until the recorder lands (#5): the mock ignores the audio.
      void engine.stop(speaker, new Blob());
    } else {
      engine.micTap(speaker);
    }
  };

  return (
    <main className={s.screen}>
      <header className={s.top}>
        <button className={s.iconBtn} aria-label="My info">
          <UserRound size={22} strokeWidth={2.1} />
        </button>
        <div className={s.brand}>
          U Mueang <span className="th">อู้เมือง</span>
        </div>
        <button className={s.iconBtn} aria-label="New conversation" onClick={() => engine.newConversation()}>
          <Plus size={24} strokeWidth={2.1} />
        </button>
      </header>

      <ChatThread state={state} />

      <ActionBar state={state} onTap={onTap} yourVerb="Speak" yourStop="Stop" yourLanguage="English" />
    </main>
  );
}
