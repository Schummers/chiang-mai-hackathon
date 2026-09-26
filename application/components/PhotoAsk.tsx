import { ScanSearch } from "lucide-react";
import type { PhotoCard } from "@/lib/engine/types";
import { Row } from "./Bubble";
import chat from "./Chat.module.css";
import c from "./ContextCard.module.css";
import s from "./PhotoAsk.module.css";

/** One extra line on a question about a photo: 22px thumbnail + "About this photo". */
export function AboutLine({ url }: { url: string }) {
  return (
    <span className={s.about}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img src={url} alt="" className={s.thumb} />
      About this photo
    </span>
  );
}

/** Your question about a photo: your side, not translated, nothing for the vendor. */
export function PhotoQuestion({ question, url }: { question: string; url: string }) {
  return (
    <Row speaker="you">
      <div className={`${chat.bubble} ${chat.enter} ${s.question}`}>
        <AboutLine url={url} />
        <p className={chat.big}>{question}</p>
      </div>
    </Row>
  );
}

/** The app's answer: woven like every app card, in the Visitor's language, naming the photo it is about. */
export function PhotoAnswer({ answer, card, url }: { answer: string; card: PhotoCard; url: string }) {
  return (
    <article className={c.frame}>
      <div className={c.card}>
        <p className={c.kicker}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
          <img src={url} alt="" className={s.thumb} />
          About: {card.title}
        </p>
        <p className={s.answer}>{answer}</p>
      </div>
    </article>
  );
}

/** Dock and thread status while the app looks at the photo to answer. */
export function LookingStatus() {
  return (
    <>
      <ScanSearch size={18} strokeWidth={2.1} /> Looking at the photo…
    </>
  );
}
