"use client";

import { Plus, UserRound } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Message, MyInfo, Speaker } from "@/lib/engine/types";
import { mergeMyInfo } from "@/lib/myInfo";
import { Recorder } from "@/lib/recorder";
import { speak, stopSpeech, unlockSpeech } from "@/lib/speech";
import { useConversation } from "@/lib/useConversation";
import { languageStore, useLanguage } from "@/lib/useLanguage";
import { useOnline } from "@/lib/useOnline";
import { myInfoStore, useMyInfo } from "@/lib/useMyInfo";
import { ChatThread } from "./ChatThread";
import { Dock } from "./Dock";
import { OfflineBanner } from "./ErrorState";
import { ListeningCard } from "./ListeningCard";
import { MyInfoCard, MyInfoPage, Toast } from "./MyInfo";
import s from "./Screen.module.css";

const MIN_RECORDING_MS = 600;

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

  const language = useLanguage();
  const online = useOnline();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playingRef = useRef<string | null>(null);

  const toggleSpeech = (message: Message) => {
    if (playingRef.current === message.id) {
      stopSpeech();
      playingRef.current = null;
      return setPlayingId(null);
    }
    playingRef.current = message.id;
    setPlayingId(message.id);
    // Your messages are read in Thai for the vendor, the vendor's in your language.
    speak(message.translation.join(" "), message.speaker === "you" ? "th" : languageStore.get(), () => {
      if (playingRef.current !== message.id) return;
      playingRef.current = null;
      setPlayingId(null);
    });
  };

  const { engine, state } = useConversation({
    getMyInfo: myInfoStore.get,
    getUserLanguage: languageStore.get,
    onDetectedInfo,
    // Auto-play your Thai message so you only have to turn the phone.
    onMessage: (m) => m.speaker === "you" && toggleSpeech(m),
  });
  const [recorder] = useState(() => new Recorder());
  const getLevel = useCallback(() => recorder.level, [recorder]);

  const finish = async (speaker: Speaker) => {
    const { phase } = engine.getState();
    if (phase.kind !== "listening" || phase.speaker !== speaker) return;
    const audio = await recorder.stop();
    // Stopped before the mic was even granted: nothing to send, give the turn back quietly.
    if (audio.size === 0) return engine.cancel();
    // A tap-tap by mistake: drop it with a hint instead of sending noise.
    if (Date.now() - phase.startedAt < MIN_RECORDING_MS) return engine.fail(speaker, "empty");
    await engine.stop(speaker, audio);
  };

  const onTap = (speaker: Speaker) => {
    const { phase } = engine.getState();
    if (phase.kind === "listening" && phase.speaker === speaker) return void finish(speaker);

    recorder.unlockAudio(); // must run inside the tap, for iOS
    stopSpeech();
    unlockSpeech();
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
    stopSpeech();
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
      {!online && <OfflineBanner />}

      <ChatThread
        state={state}
        live={live}
        playingId={playingId}
        onSpeak={toggleSpeech}
        onRetry={() => void engine.retry()}
        onDismissError={() => engine.dismissError()}
        intro={
          !infoCardClosed && (
            <MyInfoCard info={myInfo} onOpen={() => setInfoOpen(true)} onClose={() => setInfoCardClosed(true)} />
          )
        }
      />

      <Dock state={state} onTap={onTap} language={language} playingId={playingId} getLevel={getLevel} offline={!online} />

      {infoOpen && <MyInfoPage info={myInfo} onChange={myInfoStore.set} onDone={() => setInfoOpen(false)} />}
      {toast && <Toast text={toast} />}
    </main>
  );
}
