"use client";

import { Check, Plus, SlidersHorizontal, X } from "lucide-react";
import type { MyInfo } from "@/lib/engine/types";
import { ALLERGIES, DIETS, SPICES, chipLabels } from "@/lib/myInfo";
import s from "./MyInfo.module.css";

/** Compact card on a new conversation: only the selected chips, plus "+ Add". */
export function MyInfoCard({ info, onOpen, onClose }: { info: MyInfo; onOpen: () => void; onClose: () => void }) {
  const labels = chipLabels(info);
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>
          <SlidersHorizontal size={16} strokeWidth={2.1} /> My info
        </span>
        <button className={s.close} onClick={onClose} aria-label="Close My info">
          <X size={18} strokeWidth={2.1} />
        </button>
      </div>
      {labels.length === 0 && <p className={s.hint}>Allergies, spice, diet: we&apos;ll mention them in Thai for you.</p>}
      <div className={s.chips}>
        {labels.map((l) => (
          <span key={l} className={`${s.chip} ${s.on}`}>
            {l}
          </span>
        ))}
        <button className={`${s.chip} ${s.add}`} onClick={onOpen}>
          <Plus size={16} strokeWidth={2.1} /> Add
        </button>
      </div>
    </div>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className={`${s.chip} ${on ? s.on : ""}`} aria-pressed={on} onClick={onClick}>
      {on && <Check size={16} strokeWidth={2.4} />}
      {label}
    </button>
  );
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/** Full My info page, opened from the account icon. Saves on every tap. */
export function MyInfoPage({ info, onChange, onDone }: { info: MyInfo; onChange: (i: MyInfo) => void; onDone: () => void }) {
  return (
    <div className={s.overlay} role="dialog" aria-modal="true" aria-labelledby="my-info-title">
      <div className={s.sheet}>
        <header className={s.sheetHead}>
          <h2 id="my-info-title">My info</h2>
          <button className={s.close} onClick={onDone} aria-label="Close">
            <X size={22} strokeWidth={2.1} />
          </button>
        </header>
        <p className={s.lede}>Saved on this phone only, no account. Sent with every message, so the Thai mentions it for you.</p>

        <section className={s.group}>
          <h3>Allergies</h3>
          <div className={s.chips}>
            {ALLERGIES.map((a) => (
              <Chip
                key={a.value}
                label={a.label}
                on={info.allergies.includes(a.value)}
                onClick={() => onChange({ ...info, allergies: toggle(info.allergies, a.value) })}
              />
            ))}
          </div>
        </section>

        <section className={s.group}>
          <h3>Spice</h3>
          <div className={s.chips}>
            {SPICES.map((sp) => (
              <Chip
                key={sp.value}
                label={sp.label}
                on={info.spice === sp.value}
                onClick={() => onChange({ ...info, spice: info.spice === sp.value ? null : sp.value })}
              />
            ))}
          </div>
        </section>

        <section className={s.group}>
          <h3>Diet</h3>
          <div className={s.chips}>
            {DIETS.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                on={info.diet.includes(d.value)}
                onClick={() => onChange({ ...info, diet: toggle(info.diet, d.value) })}
              />
            ))}
          </div>
        </section>

        <button className={s.done} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <div className={s.toast} role="status">
      <Check size={16} strokeWidth={2.4} /> {text}
    </div>
  );
}
