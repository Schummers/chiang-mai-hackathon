"use client";

import { useEffect, useRef, useState } from "react";
import type { Speaker } from "@/lib/engine/types";
import { Row } from "./Bubble";
import s from "./ListeningCard.module.css";

const BARS = 9;

type Props = {
  speaker: Speaker;
  startedAt: number;
  /** Returns the live mic level, 0 to 1. */
  getLevel: () => number;
  label: string;
};

export function ListeningCard({ speaker, startedAt, getLevel, label }: Props) {
  const bars = useRef<(HTMLElement | null)[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // Wave: a rolling history of the mic level, drawn straight to the DOM on each frame.
  useEffect(() => {
    const history = new Array(BARS).fill(0);
    let raf = 0;
    let frame = 0;
    const draw = () => {
      if (frame++ % 3 === 0) {
        history.shift();
        history.push(getLevel());
        history.forEach((level, i) => {
          const el = bars.current[i];
          if (el) el.style.height = `${4 + Math.round(Math.min(1, level * 1.6) * 22)}px`;
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, [getLevel, startedAt]);

  const secs = Math.floor(elapsed / 1000);
  return (
    <Row speaker={speaker}>
      <div className={`${s.card} ${speaker === "you" ? s.you : s.them}`} lang={speaker === "vendor" ? "th" : undefined}>
        <span className={s.dot} />
        <span className={s.label}>{label}</span>
        <span className={s.wave} aria-hidden>
          {Array.from({ length: BARS }, (_, i) => (
            <b key={i} ref={(el) => void (bars.current[i] = el)} />
          ))}
        </span>
        <span className={s.time}>
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
        </span>
      </div>
    </Row>
  );
}
