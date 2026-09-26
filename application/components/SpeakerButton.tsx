import { Volume2 } from "lucide-react";
import s from "./Chat.module.css";

/** Round replay button outside the bubble. Shows an equalizer while playing; tap again to stop. */
export function SpeakerButton({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <button
      className={`${s.speaker} ${playing ? s.playing : ""}`}
      onClick={onClick}
      aria-label={playing ? "Stop reading" : "Read aloud"}
      aria-pressed={playing}
    >
      {playing ? (
        <span className={s.eq} aria-hidden>
          <b />
          <b />
          <b />
        </span>
      ) : (
        <Volume2 size={20} strokeWidth={2.1} />
      )}
    </button>
  );
}
