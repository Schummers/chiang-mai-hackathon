"use client";

import { Check, ChevronDown, Flame, Languages, OctagonX, Plus, UserRound, X } from "lucide-react";
import type { MyInfo, UserLanguage } from "@/lib/engine/types";
import { findLanguage, LANGUAGES } from "@/lib/language";
import { ALLERGIES, DIETS, PARTICLES, particleOf, SPICES } from "@/lib/myInfo";
import s from "./MyInfo.module.css";

type LanguageProps = { language: UserLanguage; onLanguage: (code: UserLanguage) => void };

/** Your language, always first, always in the selected style. A native select over the chip: the phone's own list. */
function LanguageChip({ language, onLanguage }: LanguageProps) {
  return (
    <label className={`${s.chip} ${s.on} ${s.lang}`}>
      <Languages size={16} strokeWidth={2.1} /> {findLanguage(language).name} <ChevronDown size={14} strokeWidth={2.4} />
      <select value={language} onChange={(e) => onLanguage(e.target.value)} aria-label="Your language">
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** About you card on a new conversation: your language, the selected needs, plus "+ Add". Thai is never a choice. */
export function MyInfoCard({
  info,
  onOpen,
  onClose,
  language,
  onLanguage,
}: { info: MyInfo; onOpen: () => void; onClose: () => void } & LanguageProps) {
  const chips = [
    ...ALLERGIES.filter((a) => info.allergies.includes(a.value)).map((a) => ({ label: a.label, Icon: OctagonX })),
    ...SPICES.filter((sp) => sp.value === info.spice).map((sp) => ({ label: sp.label, Icon: Flame })),
    ...DIETS.filter((d) => info.diet.includes(d.value)).map((d) => ({ label: d.label, Icon: Check })),
  ];
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>
          <UserRound size={18} strokeWidth={2.1} /> About you
        </span>
        <button className={s.close} onClick={onClose} aria-label="Close About you">
          <X size={18} strokeWidth={2.1} />
        </button>
      </div>
      <div className={s.chips}>
        <LanguageChip language={language} onLanguage={onLanguage} />
        {chips.map(({ label, Icon }) => (
          <span key={label} className={`${s.chip} ${s.on}`}>
            <Icon size={16} strokeWidth={2.1} /> {label}
          </span>
        ))}
        <button className={`${s.chip} ${s.add}`} onClick={onOpen}>
          <Plus size={16} strokeWidth={2.1} /> Add
        </button>
      </div>
      {chips.length === 0 && <p className={s.hint}>Allergies, spice, diet: we&apos;ll mention them in Thai for you.</p>}
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

/** Full About you page, opened from "+ Add". Saves on every tap. */
export function MyInfoPage({
  info,
  onChange,
  onDone,
  language,
  onLanguage,
}: { info: MyInfo; onChange: (i: MyInfo) => void; onDone: () => void } & LanguageProps) {
  return (
    <div className={s.overlay} role="dialog" aria-modal="true" aria-labelledby="my-info-title">
      <div className={s.sheet}>
        <header className={s.sheetHead}>
          <h2 id="my-info-title">About you</h2>
          <button className={s.close} onClick={onDone} aria-label="Close">
            <X size={22} strokeWidth={2.1} />
          </button>
        </header>
        <p className={s.lede}>Saved on this phone only, no account. Sent with every message, so the Thai mentions it for you.</p>

        <section className={s.group}>
          <h3>Your language</h3>
          <div className={s.chips}>
            {LANGUAGES.map((l) => (
              <Chip key={l.code} label={l.name} on={l.code === language} onClick={() => onLanguage(l.code)} />
            ))}
          </div>
        </section>

        <section className={s.group}>
          <h3>You speak as</h3>
          <div className={s.chips}>
            {PARTICLES.map((p) => (
              <Chip key={p.value} label={p.label} on={particleOf(info) === p.value} onClick={() => onChange({ ...info, particle: p.value })} />
            ))}
          </div>
        </section>

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
