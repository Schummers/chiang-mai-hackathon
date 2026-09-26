# U Mueang (อู้เมือง), web app

Next.js (App Router, TypeScript). Spec: GitHub issue #1. Visuals: `people/jonathan/design system/DESIGN.md`. Flow: `people/jonathan/wireframes/v5.html`.

```bash
npm install
npm run dev      # http://localhost:3000 (the mic needs HTTPS on a phone: use the Vercel URL)
npm test         # Vitest
npm run build    # must pass before any push
```

- The UI only talks to the conversation engine (`lib/engine/`). The turn service behind it is picked by `NEXT_PUBLIC_TURN_SERVICE` (`mock` by default, `api` for the real back-end).
- Keys in `.env.local` only (gitignored), and in Vercel env vars. See `.env.example`.
