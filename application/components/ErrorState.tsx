import { MicOff, RotateCcw, WifiOff, X } from "lucide-react";
import type { Phase } from "@/lib/engine/types";
import { Row } from "./Bubble";
import s from "./ErrorState.module.css";

type ErrorPhase = Extract<Phase, { kind: "error" }>;

// Vendor-side texts are in Thai (to be checked by a Thai teammate).
const TEXT = {
  network: { you: "Connection problem. Your message is kept.", vendor: "เชื่อมต่อไม่ได้ ข้อความยังอยู่" },
  retry: { you: "Retry", vendor: "ลองอีกครั้ง" },
  empty: { you: "Didn't catch that, tap and try again.", vendor: "ไม่ได้ยินครับ กดไมค์แล้วพูดอีกครั้ง" },
};

/** Nothing should leave the visitor stuck in front of a vendor. */
export function ErrorState({ phase, onRetry, onDismiss }: { phase: ErrorPhase; onRetry: () => void; onDismiss: () => void }) {
  const who = phase.speaker;
  const th = who === "vendor" ? "th" : undefined;

  if (phase.reason === "mic-denied") {
    return (
      <div className={s.card} role="alert">
        <div className={s.head}>
          <MicOff size={20} strokeWidth={2.1} />
          <b>The microphone is blocked</b>
          <button className={s.close} onClick={onDismiss} aria-label="Close">
            <X size={18} strokeWidth={2.1} />
          </button>
        </div>
        <ul className={s.steps}>
          <li>
            <b>iPhone:</b> tap <b>aA</b> in the address bar, then Website Settings, Microphone, Allow. Reload the page.
          </li>
          <li>
            <b>Android:</b> tap the icon left of the address, then Permissions, Microphone, Allow. Reload the page.
          </li>
        </ul>
      </div>
    );
  }

  if (phase.reason === "empty") {
    return (
      <p className={s.hint} lang={th} style={{ alignSelf: who === "you" ? "flex-end" : "flex-start" }}>
        {TEXT.empty[who]}
      </p>
    );
  }

  return (
    <Row speaker={who}>
      <div className={`${s.failed} ${who === "you" ? s.you : s.them}`} role="alert">
        {phase.raw && <p className={s.raw}>{phase.raw}</p>}
        <p className={s.line} lang={th}>
          <WifiOff size={16} strokeWidth={2.1} /> {TEXT.network[who]}
        </p>
        <button className={s.retry} onClick={onRetry} lang={th}>
          <RotateCcw size={16} strokeWidth={2.4} /> {TEXT.retry[who]}
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
