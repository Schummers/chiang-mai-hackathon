"use client";

import { Plus, UserRound } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { MyInfo, Speaker } from "@/lib/engine/types";
import { mergeMyInfo } from "@/lib/myInfo";
import { Recorder } from "@/lib/recorder";
import { useConversation } from "@/lib/useConversation";
import { myInfoStore, useMyInfo } from "@/lib/useMyInfo";
import { ActionBar } from "./ActionBar";
import { ChatThread } from "./ChatThread";
import { ListeningCard } from "./ListeningCard";
import { MyInfoCard, MyInfoPage, Toast } from "./MyInfo";
import s from "./Screen.module.css";

/** The one stable screen: top bar, chat, two-mic action bar. */
export function Conversation() {
  const myInfo = useMyInfo();
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoCardClosed, setInfoCardClosed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onDetectedInfo = (detected: Partial<MyInfo>) => {
    const { info, changed } = mergeMyInfo(myInfoStore.get(), detected);
    if (!changed) return;
    myInfoStore.set(info);
    setToast("Saved to My info");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const { engine, state } = useConversation({ getMyInfo: myInfoStore.get, onDetectedInfo });
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
    setInfoCardClosed(true);
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
    setInfoCardClosed(false);
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
        <button className={s.iconBtn} aria-label="My info" onClick={() => setInfoOpen(true)}>
          <UserRound size={22} strokeWidth={2.1} />
        </button>
        <div className={s.brand}>
          U Mueang <span className="th">อู้เมือง</span>
        </div>
        <button className={s.iconBtn} aria-label="New conversation" onClick={newConversation}>
          <Plus size={24} strokeWidth={2.1} />
        </button>
      </header>

      <ChatThread
        state={state}
        live={live}
        intro={
          !infoCardClosed && (
            <MyInfoCard info={myInfo} onOpen={() => setInfoOpen(true)} onClose={() => setInfoCardClosed(true)} />
          )
        }
      />

      <ActionBar state={state} onTap={onTap} yourVerb="Speak" yourStop="Stop" yourLanguage="English" />

      {infoOpen && <MyInfoPage info={myInfo} onChange={myInfoStore.set} onDone={() => setInfoOpen(false)} />}
      {toast && <Toast text={toast} />}
    </main>
  );
}
