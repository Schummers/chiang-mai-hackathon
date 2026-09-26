"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  startedAt: number;
  /** Returns the live mic level, 0 to 1. */
  getLevel: () => number;
  bars?: number;
  className?: string;
  timeClassName?: string;
};

/** Live mic wave + timer, colored by the parent (currentColor). Used in the Listening card and the dock. */
export function Wave({ startedAt, getLevel, bars: count = 9, className, timeClassName }: Props) {
  const bars = useRef<(HTMLElement | null)[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // A rolling history of the mic level, drawn straight to the DOM on each frame.
  useEffect(() => {
    const history = new Array(count).fill(0);
    let raf = 0;
    let frame = 0;
    const draw = () => {
      if (frame++ % 3 === 0) {
        history.shift();
        history.push(getLevel());
        history.forEach((level, i) => {
          const el = bars.current[i];
          if (el) el.style.height = `${4 + Math.round(Math.min(1, level * 1.6) * 18)}px`;
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
  }, [getLevel, startedAt, count]);

  const secs = Math.floor(elapsed / 1000);
  return (
    <>
      <span className={className} aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <b key={i} ref={(el) => void (bars.current[i] = el)} />
        ))}
      </span>
      <span className={timeClassName}>
        {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
      </span>
    </>
  );
}
