# Kratip restyle, tickets

Apply DESIGN.md v3 (direction "Kratip") to `application/`. Five vertical slices, each demoable on the Vercel URL on a phone.

Shared context for every ticket:

- Spec: `people/jonathan/design system/DESIGN.md` (v3, 2026-09-27). It wins over these tickets when they disagree.
- Visual reference: `people/jonathan/design system/explorations/kratip-v2.html`. Validated picks: **M2** (message contour), **P1** (play), **C2** (context card conflict), **S2** (session start), **K1** dock with **K3/K4/K5** for the middle (never K6).
- Flow stays `people/jonathan/wireframes/v5.html`, minus the language label under the mic (moved to About you).
- Rules: `application/CLAUDE.md`. Only the UI changes, never the engine. `npm test` and `npm run build` green before every push. Commit after every meaningful step, add only the files you changed.
- Deploy: Vercel builds every push to `main`. Check on a phone at the production URL, the mic needs HTTPS.

Order: 01 first, then 02 / 03 / 04 in any order, 05 last.
