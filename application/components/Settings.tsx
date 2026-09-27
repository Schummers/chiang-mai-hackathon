"use client";

import { LocateFixed, MapPin, RotateCw, X } from "lucide-react";
import { refreshLocation, useLocation, type LocationState } from "@/lib/location";
import { SETTING_ROWS, type Settings as Values } from "@/lib/settings";
import sheet from "./MyInfo.module.css";
import s from "./Settings.module.css";

const CONTEXT_KEYS: (keyof Values)[] = ["profile", "location", "time", "pack"];
const THREAD_KEYS: (keyof Values)[] = ["cards"];

function Switch({ id, on, onChange }: { id: keyof Values; on: boolean; onChange: (on: boolean) => void }) {
  const row = SETTING_ROWS.find((r) => r.key === id)!;
  return (
    <button type="button" role="switch" aria-checked={on} className={s.row} onClick={() => onChange(!on)}>
      <span className={s.text}>
        <b>{row.label}</b>
        <span>{row.hint}</span>
      </span>
      <span className={`${s.track} ${on ? s.on : ""}`} aria-hidden>
        <span className={s.thumb} />
      </span>
    </button>
  );
}

function LocationStatus({ location }: { location: LocationState }) {
  const retry = (
    <button type="button" className={s.retry} onClick={refreshLocation}>
      <RotateCw size={14} strokeWidth={2.4} /> {location.status === "ready" ? "Refresh" : "Try again"}
    </button>
  );
  switch (location.status) {
    case "off":
      return null;
    case "locating":
      return (
        <p className={s.status}>
          <LocateFixed size={16} strokeWidth={2.1} /> Finding food places near you…
        </p>
      );
    case "denied":
      return (
        <div className={s.status}>
          <MapPin size={16} strokeWidth={2.1} />
          <span>Location is blocked. Allow it for this site in your browser settings, then try again.</span>
          {retry}
        </div>
      );
    case "unavailable":
      return (
        <div className={s.status}>
          <MapPin size={16} strokeWidth={2.1} />
          <span>{location.reason}.</span>
          {retry}
        </div>
      );
    case "ready": {
      const { places, coords } = location;
      const near = [...(places?.markets.slice(0, 1) ?? []), ...(places?.food.slice(0, 3) ?? [])];
      return (
        <div className={s.status}>
          <MapPin size={16} strokeWidth={2.1} />
          <span>
            {!places
              ? "Found you, but Google Maps did not answer."
              : near.length
                ? `Near ${near.map((p) => `${p.name} (${p.distanceM} m)`).join(", ")}.`
                : "No food places listed around you."}{" "}
            <span className={s.accuracy}>±{Math.round(coords.accuracy)} m</span>
          </span>
          {retry}
        </div>
      );
    }
  }
}

/** Feature switches: what goes into each translation, and what shows in the thread. Saved on every tap. */
export function Settings({ values, onChange, onDone }: { values: Values; onChange: (v: Values) => void; onDone: () => void }) {
  const location = useLocation();
  const set = (key: keyof Values) => (on: boolean) => onChange({ ...values, [key]: on });
  return (
    <div className={sheet.overlay} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className={sheet.sheet}>
        <div className={sheet.body}>
          <header className={sheet.sheetHead}>
            <h2 id="settings-title">Settings</h2>
            <button className={sheet.close} onClick={onDone} aria-label="Close">
              <X size={22} strokeWidth={2.1} />
            </button>
          </header>
          <p className={sheet.lede}>Choose what the translator knows. It is sent with each message and never stored on our side.</p>

          <section className={sheet.group}>
            <h3>Sent with each message</h3>
            <div className={s.list}>
              {CONTEXT_KEYS.map((key) => (
                <div key={key}>
                  <Switch id={key} on={values[key]} onChange={set(key)} />
                  {key === "location" && values.location && <LocationStatus location={location} />}
                </div>
              ))}
            </div>
          </section>

          <section className={sheet.group}>
            <h3>In the conversation</h3>
            <div className={s.list}>
              {THREAD_KEYS.map((key) => (
                <Switch key={key} id={key} on={values[key]} onChange={set(key)} />
              ))}
            </div>
          </section>
        </div>

        <div className={sheet.footer}>
          <button className={sheet.done} onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
