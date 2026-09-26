"use client";

import { Expand, MessageCircleQuestion, Repeat, Speech, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MoveCard as Card, MoveType } from "@/lib/engine/types";
import { moveLines } from "@/lib/moveCard";
import { speak, stopSpeech } from "@/lib/speech";
import chat from "./Chat.module.css";
import frame from "./ContextCard.module.css";
import s from "./MoveCard.module.css";

const ICON: Record<MoveType, typeof Speech> = { say: Speech, ask: MessageCircleQuestion, echo: Repeat };

/**
 * Move card (ticket 02): one Move the Visitor says themselves, in the slot of the context card (same frame, width, entry).
 * One tap plays the Thai; "Show the vendor" puts it full screen. Collapses to one line once the next Turn lands.
 */
export function MoveCard({ card, collapsed }: { card: Card; collapsed: boolean }) {
  const lines = moveLines(card);
  const Icon = ICON[card.type];
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const [showing, setShowing] = useState(false);

  useEffect(
    () => () => {
      if (playingRef.current) stopSpeech();
    },
    [],
  );

  // speak() runs inside the tap handler: iOS only lets a page speak from a user gesture.
  const play = () => {
    if (playingRef.current) {
      stopSpeech();
      playingRef.current = false;
      return setPlaying(false);
    }
    playingRef.current = true;
    setPlaying(true);
    speak(lines.speak, "th", () => {
      playingRef.current = false;
      setPlaying(false);
    });
  };

  return (
    <article className={`${frame.frame} ${s.move}`} data-move={card.id}>
      <div
        className={`${frame.card} ${s.card} ${collapsed ? s.collapsed : ""} ${playing ? s.playing : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={playing}
        aria-label={`${lines.label}: ${lines.english}. Tap to hear it in Thai.`}
        onClick={play}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          play();
        }}
      >
        <p className={frame.kicker}>
          <Icon size={14} strokeWidth={2.1} aria-hidden /> {lines.label}
          {collapsed && (
            <span className={s.line} lang="th">
              {lines.big}
            </span>
          )}
        </p>

        {!collapsed && (
          <>
            {lines.heard && (
              <p className={s.heard}>
                Vendor said <span lang="th">{lines.heard}</span>
              </p>
            )}
            <p className={s.big} lang="th">
              {lines.big}
            </p>
            {lines.small && (
              <p className={s.small} lang="th">
                {lines.small}
              </p>
            )}
            <p className={s.roman}>{lines.roman}</p>
            <p className={s.english}>{lines.english}</p>

            <div className={s.tools}>
              <span className={`${chat.tool} ${playing ? chat.playing : ""}`} aria-hidden>
                <Volume2 size={16} strokeWidth={2.1} className={playing ? chat.arcs : undefined} />
                {playing ? "Playing" : "Play"}
              </span>
              <button
                type="button"
                className={`${chat.tool} ${s.show}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowing(true);
                }}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Expand size={16} strokeWidth={2.1} aria-hidden />
                Show the vendor
              </button>
            </div>
          </>
        )}
      </div>
      {showing && createPortal(<ShowVendor big={lines.big} small={lines.small} onClose={() => setShowing(false)} />, document.body)}
    </article>
  );
}

/** The Thai full screen, large type, for the Visitor to turn the phone to the Vendor. Tap anywhere or Escape closes. */
function ShowVendor({ big, small, onClose }: { big: string; small: string | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // Portal events still bubble through the React tree: stop them so they never reach the card (which plays on tap).
    <div
      className={s.vendor}
      role="dialog"
      aria-modal="true"
      aria-label="Thai for the vendor"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button type="button" className={s.close} aria-label="Close" autoFocus>
        <X size={24} strokeWidth={2.1} />
      </button>
      <p className={s.vendorBig} lang="th">
        {big}
      </p>
      {small && (
        <p className={s.vendorSmall} lang="th">
          {small}
        </p>
      )}
    </div>
  );
}
