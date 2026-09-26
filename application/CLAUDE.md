@AGENTS.md

# Application: U Mueang web app

Next.js (App Router) + TypeScript, deployed on Vercel. Read the root `CLAUDE.md` first.

```bash
npm install
npm run dev      # local dev server
npm test         # Vitest, must pass before any push
npm run build    # must pass before any push
```

**Docs: start with [`docs/README.md`](docs/README.md)** (architecture, contract, Context Pack, decisions, status).

## Rules

- The UI only talks to the conversation engine (`lib/engine/`). Never call a provider from a component.
- The back-end plugs in by implementing `TurnService` (`lib/engine/types.ts`); the mock stays for demos and tests.
- Visuals from `people/jonathan/design system/DESIGN.md`, flow from `people/jonathan/wireframes/v5.html` (the flow wins when they disagree).
- Keep each feature in its own component file under `components/`; touch `app/page.tsx` as little as possible.
- Mobile first. The mic needs HTTPS: test on the Vercel URL, not on a LAN IP.
- Secrets in `.env.local` only (gitignored) and in Vercel env vars. Never hardcode a key: the repo is public.
- A change to the contract, the Turn flow or a decision updates the matching file in `docs/` in the same commit.
