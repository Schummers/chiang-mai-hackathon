import { useId } from "react";
import s from "./Logo.module.css";

/**
 * The mark: a ก๋วย (woven market basket) shaped as a speech bubble.
 * PLACEHOLDER, copied from people/jonathan/design system/explorations/kratip-v2.html (<symbol id="mark">).
 * Replace with the real logo source (bamboo rim with knots, herringbone weave, tail bottom-left) when we have it.
 */
export function LogoMark({ size }: { size: number }) {
  const weave = `weave-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={s.mark}>
      <defs>
        <pattern id={weave} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" style={{ fill: "var(--white)" }} />
          <rect x="0" y="1" width="10" height="4" rx="1" style={{ fill: "var(--them)" }} />
          <rect x="1" y="7" width="4" height="10" rx="1" style={{ fill: "var(--them)" }} />
        </pattern>
      </defs>
      <path
        d="M12 4h40a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H26l-12 10v-10h-2a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z"
        fill={`url(#${weave})`}
        strokeWidth="3.5"
        strokeLinejoin="round"
        style={{ stroke: "var(--you)" }}
      />
      <path d="M32 10 L50 28 L32 46 L14 28 Z" style={{ fill: "var(--white)" }} />
      <text x="32" y="36" textAnchor="middle" fontWeight="700" fontSize="21" className={s.markText}>
        อู้
      </text>
    </svg>
  );
}

/** Header lockup: mark 34 + อู้เมือง over U Mueang. No location line. */
export function Logo() {
  return (
    <div className={s.logo}>
      <LogoMark size={34} />
      <div className={s.words}>
        <span className={s.thai} lang="th">
          อู้เมือง
        </span>
        <span className={s.latin}>U Mueang</span>
      </div>
    </div>
  );
}
