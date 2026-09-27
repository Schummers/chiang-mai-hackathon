"use client";

import { ArrowLeftRight, Check, ChevronDown, Flame, NotebookPen, OctagonX, Plus, UserRound, X } from "lucide-react";
import type { Languages, MyInfo } from "@/lib/engine/types";
import { findLanguage, LANGUAGES, pickLanguage } from "@/lib/language";
import { ALLERGIES, DIETS, NOTES_MAX, PARTICLES, particleOf, SPICES } from "@/lib/myInfo";
import s from "./MyInfo.module.css";

type LanguageProps = { languages: Languages; onLanguages: (languages: Languages) => void };

/** One side's language. A native select over the chip: the phone's own list. */
function LanguageChip({ side, languages, onLanguages }: { side: keyof Languages } & LanguageProps) {
  return (
    <label className={`${s.chip} ${s.on} ${s.lang}`}>
      {findLanguage(languages[side]).name} <ChevronDown size={14} strokeWidth={2.4} />
      <select
        value={languages[side]}
        onChange={(e) => onLanguages(pickLanguage(languages, side, e.target.value))}
        aria-label={side === "me" ? "Your language" : "Their language"}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** About you card on a new conversation: both languages, the selected needs, plus "+ Add". */
export function MyInfoCard({ info, onOpen, onClose, languages, onLanguages }: { info: MyInfo; onOpen: () => void; onClose: () => void } & LanguageProps) {
  const chips = [
    ...ALLERGIES.filter((a) => info.allergies.includes(a.value)).map((a) => ({ label: a.label, Icon: OctagonX })),
    ...SPICES.filter((sp) => sp.value === info.spice).map((sp) => ({ label: sp.label, Icon: Flame })),
    ...DIETS.filter((d) => info.diet.includes(d.value)).map((d) => ({ label: d.label, Icon: Check })),
    ...(info.notes?.trim() ? [{ label: "Your notes", Icon: NotebookPen }] : []),
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
        <LanguageChip side="me" languages={languages} onLanguages={onLanguages} />
        <button
          className={s.swap}
          onClick={() => onLanguages({ me: languages.them, them: languages.me })}
          aria-label="Swap languages"
        >
          <ArrowLeftRight size={16} strokeWidth={2.1} />
        </button>
        <LanguageChip side="them" languages={languages} onLanguages={onLanguages} />
      </div>
      <div className={s.chips}>
        {chips.map(({ label, Icon }) => (
          <span key={label} className={`${s.chip} ${s.on}`}>
            <Icon size={16} strokeWidth={2.1} /> {label}
          </span>
        ))}
        <button className={`${s.chip} ${s.add}`} onClick={onOpen}>
          <Plus size={16} strokeWidth={2.1} /> Add
        </button>
      </div>
      {chips.length === 0 && <p className={s.hint}>Allergies, diet, notes or today&apos;s specials: the translator keeps them in mind.</p>}
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
  languages,
  onLanguages,
}: { info: MyInfo; onChange: (i: MyInfo) => void; onDone: () => void } & LanguageProps) {
  return (
    <div className={s.overlay} role="dialog" aria-modal="true" aria-labelledby="my-info-title">
      <div className={s.sheet}>
        {/* The sections scroll if the phone is short; Done stays pinned at the bottom, always visible. */}
        <div className={s.body}>
          <header className={s.sheetHead}>
            <h2 id="my-info-title">About you</h2>
            <button className={s.close} onClick={onDone} aria-label="Close">
              <X size={22} strokeWidth={2.1} />
            </button>
          </header>
          <p className={s.lede}>Sent with every message, so the translation takes it into account.</p>

          {(["me", "them"] as const).map((side) => (
            <section key={side} className={s.group}>
              <h3>{side === "me" ? "Your language" : "Their language"}</h3>
              <div className={s.chips}>
                {LANGUAGES.map((l) => (
                  <Chip key={l.code} label={l.name} on={l.code === languages[side]} onClick={() => onLanguages(pickLanguage(languages, side, l.code))} />
                ))}
              </div>
            </section>
          ))}

          {languages.them === "th" && (
            <section className={s.group}>
              <h3>Your Thai ends with</h3>
              <div className={s.chips}>
                {PARTICLES.map((p) => (
                  <Chip key={p.value} label={p.label} on={particleOf(info) === p.value} onClick={() => onChange({ ...info, particle: p.value })} />
                ))}
              </div>
            </section>
          )}

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

          <section className={s.group}>
            <h3>
              <label htmlFor="my-info-notes">Anything else</label>
            </h3>
            <textarea
              id="my-info-notes"
              className={s.notes}
              rows={4}
              maxLength={NOTES_MAX}
              value={info.notes ?? ""}
              placeholder="Another allergy (cashews, egg…), what you're looking for, or if you run the shop: today's menu and specials."
              onChange={(e) => onChange({ ...info, notes: e.target.value })}
            />
          </section>
        </div>

        <div className={s.footer}>
          <button className={s.done} onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
