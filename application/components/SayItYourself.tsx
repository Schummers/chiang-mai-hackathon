"use client";

import { Snail, Speech, Volume2, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Message } from "@/lib/engine/types";
import { sayItRows } from "@/lib/sayIt";
import { usePlayToggle } from "@/lib/usePlayToggle";
import chat from "./Chat.module.css";
import { Overlay } from "./Overlay";
import s from "./SayItYourself.module.css";

const SLOW_RATE = 0.6;
/** A downward swipe longer than this closes the sheet. */
const SWIPE_CLOSE_PX = 70;

/**
 * "Say it yourself" tool, right of Play on the Visitor's bubble. Opens the sheet without playing the bubble.
 * `recording`: a mic is listening, so the sheet's voice stays off (it would be recorded as the Turn).
 */
export function SayItTool({ message, recording = false }: { message: Message; recording?: boolean }) {
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
      {open && <SayItSheet message={message} recording={recording} onClose={() => setOpen(false)} />}
    </>
  );
}

type Rate = "normal" | "slow";

/** Teaches the Visitor to say their Thai: Thai big, syllable phonetics, meaning, normal and slow audio. No scoring (V2). */
export function SayItSheet({ message, recording = false, onClose }: { message: Message; recording?: boolean; onClose: () => void }) {
  const { playing, toggle } = usePlayToggle<Rate>();
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  const thai = message.translation;
  const rows = sayItRows(message);

  // Closing unmounts the sheet, and the voice stops with it.
  const close = onClose;
  const play = (rate: Rate) => toggle(rate, thai.join(" "), rate === "slow" ? SLOW_RATE : undefined);

  return (
    <Overlay className={s.overlay} onClose={close}>
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
          <button type="button" className={`${s.listen} ${playing === "normal" ? s.on : ""}`} aria-pressed={playing === "normal"} disabled={recording} onClick={() => play("normal")}>
            <Volume2 size={18} strokeWidth={2.1} aria-hidden />
            {playing === "normal" ? "Playing" : "Listen"}
          </button>
          <button type="button" className={`${s.listen} ${s.ghost} ${playing === "slow" ? s.on : ""}`} aria-pressed={playing === "slow"} disabled={recording} onClick={() => play("slow")}>
            <Snail size={18} strokeWidth={2.1} aria-hidden />
            {playing === "slow" ? "Playing" : "Slowly"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
