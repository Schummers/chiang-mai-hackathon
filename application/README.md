# U Mueang (อู้เมือง), web app

Next.js (App Router, TypeScript). Spec: GitHub issue #1. Visuals: `people/jonathan/design system/DESIGN.md`. Flow: `people/jonathan/wireframes/v5.html`.

```bash
npm install
npm run dev      # http://localhost:3000 (the mic needs HTTPS on a phone: use the Vercel URL)
npm test         # Vitest
npm run build    # must pass before any push
```

- Product brief: [`context.md`](context.md). How it works: [`docs/architecture.md`](docs/architecture.md).
- The UI only talks to the conversation engine (`lib/engine/`), which calls `/api/translate` (Claude) and `/api/places` (Google Maps).
- Keys in `.env.local` only (gitignored), and in Vercel env vars. See `.env.example`.
