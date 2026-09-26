"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speak, stopSpeech } from "./speech";

/**
 * Play / stop toggle on the browser voice, for Thai the Visitor learns to say (Move card, Say it yourself).
 * `toggle(key, text)` plays, or stops when `key` is already playing; another key takes over. Speech stops on unmount.
 * Call `toggle` inside the tap handler: iOS only lets a page speak from a user gesture.
 */
export function usePlayToggle<K extends string = "play">() {
  const [playing, setPlaying] = useState<K | null>(null);
  const playingRef = useRef<K | null>(null);

  const stop = useCallback(() => {
    if (playingRef.current) stopSpeech();
    playingRef.current = null;
    setPlaying(null);
  }, []);

  useEffect(
    () => () => {
      if (playingRef.current) stopSpeech();
    },
    [],
  );

  const toggle = (key: K, text: string, rate?: number) => {
    if (playingRef.current === key) return stop();
    playingRef.current = key;
    setPlaying(key);
    speak(
      text,
      "th",
      () => {
        // A newer play cancelled this one: its end must not reset the newer state.
        if (playingRef.current !== key) return;
        playingRef.current = null;
        setPlaying(null);
      },
      rate,
    );
  };

  return { playing, toggle, stop };
}
