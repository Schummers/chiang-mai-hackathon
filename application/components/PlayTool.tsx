import { Volume2 } from "lucide-react";
import s from "./Chat.module.css";

/** Play tool at the bottom of a message (DESIGN.md §5 "Play"). Not a button itself: the whole card is. */
export function PlayTool({ playing, again }: { playing: boolean; again: boolean }) {
  return (
    <span className={`${s.tool} ${playing ? s.playing : ""}`} aria-hidden>
      <Volume2 size={16} strokeWidth={2.1} className={playing ? s.arcs : undefined} />
      {playing ? "Playing" : again ? "Play again" : "Play"}
    </span>
  );
}
