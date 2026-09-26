import { Camera } from "lucide-react";
import s from "./PhotoShot.module.css";

/** Your photo in the thread: the bare image, your corner shape, one badge. Full while reading, a strip once read. */
export function PhotoShot({ url, read }: { url: string; read: boolean }) {
  return (
    <div className={`${s.shot} ${read ? s.read : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, nothing to optimise */}
      <img src={url} alt="Your photo" className={s.img} />
      <span className={s.badge}>
        <Camera size={14} strokeWidth={2.4} /> Photo
      </span>
    </div>
  );
}
