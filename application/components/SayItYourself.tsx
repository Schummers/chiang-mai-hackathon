"use client";

import { Snail, Speech, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Message } from "@/lib/engine/types";
import { speak, stopSpeech } from "@/lib/speech";
import chat from "./Chat.module.css";
import s from "./SayItYourself.module.css";

const SLOW_RATE = 0.6;
/** A downward swipe longer than this closes the sheet. */
const SWIPE_CLOSE_PX = 70;

/** "Say it yourself" tool, right of Play on the Visitor's bubble. Opens the sheet without playing the bubble. */
export function SayItTool({ message }: { message: Message }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`${chat.tool} ${s.toolBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Speech size={16} strokeWidth={2.1} aria-hidden />
        Say it yourself
      </button>
      {open && createPortal(<SayItSheet message={message} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

type Rate = "normal" | "slow";

/** Teaches the Visitor to say their Thai: Thai big, syllable phonetics, meaning, normal and slow audio. No scoring (V2). */
export function SayItSheet({ message, onClose }: { message: Message; onClose: () => void }) {
  const [playing, setPlaying] = useState<Rate | null>(null);
  const playingRef = useRef<Rate | null>(null);
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  const thai = message.translation;
  const roman = message.romanised ?? [];
  const meaning = message.original;
  // One row per item when the three lists line up, otherwise one block each.
  const aligned = roman.length === thai.length && meaning.length === thai.length;
  const rows = aligned
    ? thai.map((t, i) => ({ thai: t, roman: roman[i], meaning: meaning[i] }))
    : [{ thai: thai.join(" "), roman: roman.join(" "), meaning: meaning.join(" ") }];

  const close = () => {
    if (playingRef.current) stopSpeech();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const play = (rate: Rate) => {
    if (playingRef.current === rate) {
      stopSpeech();
      playingRef.current = null;
      return setPlaying(null);
    }
    playingRef.current = rate;
    setPlaying(rate);
    speak(
      thai.join(" "),
      "th",
      () => {
        if (playingRef.current !== rate) return;
        playingRef.current = null;
        setPlaying(null);
      },
      rate === "slow" ? SLOW_RATE : undefined,
    );
  };

  return (
    // Portal events still bubble through the React tree: stop them here so they never reach the bubble (which plays on tap).
    <div
      className={s.overlay}
      onClick={(e) => {
        e.stopPropagation();
        close();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="say-it-title"
        style={drag ? { transform: `translateY(${drag}px)`, animation: "none" } : undefined}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          // Swipe down closes only from the top, so a long sheet can still scroll.
          startY.current = e.currentTarget.scrollTop <= 0 ? e.touches[0].clientY : null;
        }}
        onTouchMove={(e) => {
          if (startY.current === null) return;
          setDrag(Math.max(0, e.touches[0].clientY - startY.current));
        }}
        onTouchEnd={() => {
          startY.current = null;
          if (drag > SWIPE_CLOSE_PX) return close();
          setDrag(0);
        }}
      >
        <div className={s.grip} aria-hidden />
        <div className={s.head}>
          <h2 id="say-it-title">Say it yourself</h2>
          <button type="button" className={s.close} aria-label="Close" onClick={close}>
            <X size={20} strokeWidth={2.1} />
          </button>
        </div>

        <ol className={s.items}>
          {rows.map((r, i) => (
            <li key={i}>
              <p className={s.thai} lang="th">
                {r.thai}
              </p>
              {r.roman && <p className={s.roman}>{r.roman}</p>}
              {r.meaning && <p className={s.meaning}>{r.meaning}</p>}
            </li>
          ))}
        </ol>

        <div className={s.actions}>
          <button type="button" className={`${s.listen} ${playing === "normal" ? s.on : ""}`} aria-pressed={playing === "normal"} onClick={() => play("normal")}>
            <Volume2 size={18} strokeWidth={2.1} aria-hidden />
            {playing === "normal" ? "Playing" : "Listen"}
          </button>
          <button type="button" className={`${s.listen} ${s.ghost} ${playing === "slow" ? s.on : ""}`} aria-pressed={playing === "slow"} onClick={() => play("slow")}>
            <Snail size={18} strokeWidth={2.1} aria-hidden />
            {playing === "slow" ? "Playing" : "Slowly"}
          </button>
        </div>
      </div>
    </div>
  );
}
