"use client";

import { Plus, UserRound } from "lucide-react";
import { useCallback, useState } from "react";
import type { Speaker } from "@/lib/engine/types";
import { Recorder } from "@/lib/recorder";
import { useConversation } from "@/lib/useConversation";
import { ActionBar } from "./ActionBar";
import { ChatThread } from "./ChatThread";
import { ListeningCard } from "./ListeningCard";
import s from "./Screen.module.css";

/** The one stable screen: top bar, chat, two-mic action bar. */
export function Conversation() {
  const { engine, state } = useConversation({});
  const [recorder] = useState(() => new Recorder());
  const getLevel = useCallback(() => recorder.level, [recorder]);

  const finish = async (speaker: Speaker) => {
    const { phase } = engine.getState();
    if (phase.kind !== "listening" || phase.speaker !== speaker) return;
    const audio = await recorder.stop();
    await engine.stop(speaker, audio);
  };

  const onTap = (speaker: Speaker) => {
    const { phase } = engine.getState();
    if (phase.kind === "listening" && phase.speaker === speaker) return void finish(speaker);

    recorder.unlockAudio(); // must run inside the tap, for iOS
    engine.micTap(speaker);
    const now = engine.getState().phase;
    if (now.kind !== "listening" || now.speaker !== speaker) return;
    recorder.start({ onAutoStop: () => void finish(speaker) }).catch(() => {
      recorder.cancel();
      engine.fail(speaker, "mic-denied");
    });
  };

  const newConversation = () => {
    recorder.cancel();
    engine.newConversation();
  };

  const { phase } = state;
  const live =
    phase.kind === "listening" ? (
      <ListeningCard
        speaker={phase.speaker}
        startedAt={phase.startedAt}
        getLevel={getLevel}
        label={phase.speaker === "vendor" ? "กำลังฟัง" : "Listening"}
      />
    ) : null;

  return (
    <main className={s.screen}>
      <header className={s.top}>
        <button className={s.iconBtn} aria-label="My info">
          <UserRound size={22} strokeWidth={2.1} />
        </button>
        <div className={s.brand}>
          U Mueang <span className="th">อู้เมือง</span>
        </div>
        <button className={s.iconBtn} aria-label="New conversation" onClick={newConversation}>
          <Plus size={24} strokeWidth={2.1} />
        </button>
      </header>

      <ChatThread state={state} live={live} />

      <ActionBar state={state} onTap={onTap} yourVerb="Speak" yourStop="Stop" yourLanguage="English" />
    </main>
  );
}
