import { Mic, Plus, UserRound } from "lucide-react";
import s from "@/components/Screen.module.css";
import a from "@/components/ActionBar.module.css";

export default function Home() {
  return (
    <main className={s.screen}>
      <header className={s.top}>
        <button className={s.iconBtn} aria-label="My info">
          <UserRound size={22} strokeWidth={2.1} />
        </button>
        <div className={s.brand}>
          U Mueang <span className="th">อู้เมือง</span>
        </div>
        <button className={s.iconBtn} aria-label="New conversation">
          <Plus size={24} strokeWidth={2.1} />
        </button>
      </header>

      <section className={s.chat}>
        <div className={s.hello}>
          <b>Say what&apos;s on your mind.</b>
          <span>We&apos;ll turn it into clear Thai.</span>
        </div>
      </section>

      <footer className={a.bar}>
        <div className={`${a.act} ${a.them}`}>
          <button className={a.mic}>
            <Mic size={26} strokeWidth={2.1} />
            <span className={a.verb}>พูด</span>
          </button>
          <div className={a.lang}>ไทย</div>
        </div>
        <div className={`${a.act} ${a.you}`}>
          <button className={a.mic}>
            <Mic size={26} strokeWidth={2.1} />
            <span className={a.verb}>Speak</span>
          </button>
          <div className={a.lang}>English</div>
        </div>
      </footer>
    </main>
  );
}
