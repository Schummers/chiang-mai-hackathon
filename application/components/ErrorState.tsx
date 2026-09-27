import { MicOff, RotateCcw, WifiOff, X } from "lucide-react";
import type { Phase } from "@/lib/engine/types";
import { Row } from "./Bubble";
import s from "./ErrorState.module.css";

type ErrorPhase = Extract<Phase, { kind: "error" }>;

// Shown to whoever was speaking, in their language when we have it (Thai to be checked by a Thai teammate).
const TEXT: Record<"network" | "retry" | "empty", Record<string, string>> = {
  network: { en: "Connection problem. Your message is kept.", th: "เชื่อมต่อไม่ได้ ข้อความยังอยู่" },
  retry: { en: "Retry", th: "ลองอีกครั้ง" },
  empty: { en: "Didn't catch that, tap and try again.", th: "ไม่ได้ยิน กดไมค์แล้วพูดอีกครั้ง" },
};
const text = (key: keyof typeof TEXT, language: string) => TEXT[key][language] ?? TEXT[key].en;

/** Nothing should leave either person stuck at the counter. */
export function ErrorState({ phase, language, onRetry, onDismiss }: { phase: ErrorPhase; language: string; onRetry: () => void; onDismiss: () => void }) {
  if (phase.reason === "mic-denied" || phase.reason === "no-speech-api") {
    return (
      <div className={s.card} role="alert">
        <div className={s.head}>
          <MicOff size={20} strokeWidth={2.1} />
          <b>{phase.reason === "mic-denied" ? "The microphone is blocked" : "Speech recognition isn't available here"}</b>
          <button className={s.close} onClick={onDismiss} aria-label="Close">
            <X size={18} strokeWidth={2.1} />
          </button>
        </div>
        {phase.reason === "mic-denied" ? (
          <ul className={s.steps}>
            <li>
              <b>iPhone:</b> tap <b>aA</b> in the address bar, then Website Settings, Microphone, Allow. Reload the page.
            </li>
            <li>
              <b>Android / Chrome:</b> tap the icon left of the address, then Permissions, Microphone, Allow. Reload the page.
            </li>
          </ul>
        ) : (
          <ul className={s.steps}>
            <li>Open this page in Chrome or Safari, over HTTPS, with an internet connection.</li>
          </ul>
        )}
      </div>
    );
  }

  if (phase.reason === "empty") {
    return (
      <p className={s.hint} lang={language} style={{ alignSelf: phase.side === "me" ? "flex-end" : "flex-start" }}>
        {text("empty", language)}
      </p>
    );
  }

  return (
    <Row side={phase.side}>
      <div className={`${s.failed} ${phase.side === "me" ? s.you : s.them}`} role="alert">
        {phase.heard && <p className={s.raw}>{phase.heard}</p>}
        <p className={s.line} lang={language}>
          <WifiOff size={16} strokeWidth={2.1} /> {text("network", language)}
        </p>
        <button className={s.retry} onClick={onRetry} lang={language}>
          <RotateCcw size={16} strokeWidth={2.4} /> {text("retry", language)}
        </button>
      </div>
    </Row>
  );
}

export function OfflineBanner() {
  return (
    <div className={s.banner} role="status">
      <WifiOff size={16} strokeWidth={2.1} />
      <span>
        No internet. <span lang="th">ไม่มีอินเทอร์เน็ต</span>
      </span>
    </div>
  );
}
