"use client";

import { Plus, SlidersHorizontal, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineOptions } from "@/lib/engine/engine";
import type { Message, Side } from "@/lib/engine/types";
import { findLanguage } from "@/lib/language";
import { currentPlaces, refreshLocation, startLocation, stopLocation } from "@/lib/location";
import { speak, stopSpeech, unlockSpeech } from "@/lib/speech";
import { SpeechInput, speechInputSupported } from "@/lib/speechInput";
import { useConversation } from "@/lib/useConversation";
import { languagesStore, useLanguages } from "@/lib/useLanguage";
import { myInfoStore, useMyInfo } from "@/lib/useMyInfo";
import { useOnline } from "@/lib/useOnline";
import { settingsStore, useSettings } from "@/lib/useSettings";
import { ChatThread } from "./ChatThread";
import { Dock } from "./Dock";
import { OfflineBanner } from "./ErrorState";
import { ListeningCard } from "./ListeningCard";
import { Logo } from "./Logo";
import { MyInfoCard, MyInfoPage } from "./MyInfo";
import { Settings } from "./Settings";
import s from "./Screen.module.css";

/** Languages, context and switches for the next translation, per the Settings switches. */
const turnInput: EngineOptions["getInput"] = () => {
  const on = settingsStore.get();
  const { notes, ...profile } = myInfoStore.get();
  const places = on.location ? currentPlaces() : undefined;
  return {
    languages: languagesStore.get(),
    context: {
      // The particle is how the owner's Thai sounds, not context: it goes even with About you switched off.
      profile: on.profile ? profile : { allergies: [], spice: null, diet: [], ...(profile.particle && { particle: profile.particle }) },
      ...(on.profile && notes?.trim() && { notes }),
      ...(places && { places }),
      ...(on.time && { time: { now: new Date().toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone } }),
    },
    options: { cards: on.cards, pack: on.pack },
  };
};

/** The one screen: top bar, chat, two-mic dock. */
export function Conversation() {
  const myInfo = useMyInfo();
  const settings = useSettings();
  const languages = useLanguages();
  const online = useOnline();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoCardClosed, setInfoCardClosed] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playingRef = useRef<string | null>(null);
  const [interim, setInterim] = useState("");
  const [dictation] = useState(() => new SpeechInput());
  const getLevel = useCallback(() => dictation.level, [dictation]);

  /** Reads a message in its listener's language; tapping the one playing stops it. */
  const toggleSpeech = (message: Message) => {
    if (playingRef.current === message.id) {
      stopSpeech();
      playingRef.current = null;
      return setPlayingId(null);
    }
    playingRef.current = message.id;
    setPlayingId(message.id);
    const { me, them } = languagesStore.get();
    speak(message.translation, message.side === "me" ? them : me, () => {
      if (playingRef.current !== message.id) return;
      playingRef.current = null;
      setPlayingId(null);
    });
  };

  const { engine, state } = useConversation({
    getInput: turnInput,
    // The owner's message is read aloud for the other person, so the owner only has to turn the phone.
    onMessage: (m) => m.side === "me" && toggleSpeech(m),
  });

  // Location on app load: asks for permission if it was never given, stays quiet if it was denied.
  useEffect(() => {
    if (settings.location) void startLocation();
    else stopLocation();
  }, [settings.location]);

  const finish = async (side: Side) => {
    const { phase } = engine.getState();
    if (phase.kind !== "listening" || phase.side !== side) return;
    const text = await dictation.stop();
    setInterim("");
    if (!text && dictation.broken) return engine.fail(side, "no-speech-api");
    await engine.heard(side, text);
  };

  const onTap = (side: Side) => {
    const { phase } = engine.getState();
    if (phase.kind === "listening") {
      if (phase.side === side) void finish(side);
      return;
    }
    stopSpeech();
    unlockSpeech(); // must run inside the tap, for iOS
    setInfoCardClosed(true);
    engine.micTap(side);
    if (!speechInputSupported()) return engine.fail(side, "no-speech-api");
    setInterim("");
    dictation
      .start({ lang: findLanguage(languagesStore.get()[side]).locale, onInterim: setInterim, onAutoStop: () => void finish(side) })
      .catch(() => {
        const broken = dictation.broken;
        dictation.cancel();
        setInterim("");
        engine.fail(side, broken ? "no-speech-api" : "mic-denied");
      });
  };

  /** A context card's suggestion: sent as the owner's message, corrected, translated and read aloud. */
  const onSuggest = (text: string) => {
    stopSpeech();
    unlockSpeech(); // inside the tap, for iOS
    void engine.say("me", text);
  };

  const newConversation = () => {
    dictation.cancel();
    setInterim("");
    stopSpeech();
    playingRef.current = null;
    setPlayingId(null);
    engine.newConversation();
    setInfoCardClosed(false);
    // A new conversation is often a new stall: look around again.
    if (settingsStore.get().location) refreshLocation();
  };

  const { phase } = state;
  // On an empty conversation, bring the About you card back; once talking, open the full page.
  const openAboutYou = () => (state.messages.length === 0 && phase.kind === "idle" ? setInfoCardClosed(false) : setInfoOpen(true));

  const live =
    phase.kind === "listening" ? (
      <ListeningCard
        side={phase.side}
        startedAt={phase.startedAt}
        getLevel={getLevel}
        label={findLanguage(languages[phase.side]).listening}
        language={languages[phase.side]}
        interim={interim}
      />
    ) : null;

  return (
    <main className={s.screen}>
      <div className={s.topWrap}>
        <header className={s.top}>
          <Logo />
          <div className={s.actions}>
            <button className={s.iconBtn} aria-label="About you" onClick={openAboutYou}>
              <UserRound size={20} strokeWidth={2.1} />
            </button>
            <button className={s.iconBtn} aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <SlidersHorizontal size={20} strokeWidth={2.1} />
            </button>
            <button className={s.iconBtn} aria-label="New conversation" onClick={newConversation}>
              <Plus size={20} strokeWidth={2.1} />
            </button>
          </div>
        </header>
        {!online && <OfflineBanner />}
      </div>

      <ChatThread
        state={state}
        languages={languages}
        live={live}
        playingId={playingId}
        onSpeak={toggleSpeech}
        onRetry={() => void engine.retry()}
        onDismissError={() => engine.dismissError()}
        onSuggest={settings.cards ? onSuggest : undefined}
        intro={
          !infoCardClosed && (
            <MyInfoCard
              info={myInfo}
              onOpen={() => setInfoOpen(true)}
              onClose={() => setInfoCardClosed(true)}
              languages={languages}
              onLanguages={languagesStore.set}
            />
          )
        }
      />

      <Dock state={state} onTap={onTap} languages={languages} playingId={playingId} getLevel={getLevel} offline={!online} />

      {infoOpen && (
        <MyInfoPage info={myInfo} onChange={myInfoStore.set} onDone={() => setInfoOpen(false)} languages={languages} onLanguages={languagesStore.set} />
      )}
      {settingsOpen && <Settings values={settings} onChange={settingsStore.set} onDone={() => setSettingsOpen(false)} />}
    </main>
  );
}
