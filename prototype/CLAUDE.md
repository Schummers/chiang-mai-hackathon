# Prototype (frozen)

**This Vite prototype is frozen.** The real app now lives in `application/` (Next.js, see `application/CLAUDE.md`). Do not build new features here. Whether this folder is deleted is decided by the tech lead (TBD).

# Prototype — Web App

Vite + React 19 + TypeScript. Read the root `CLAUDE.md` first.

```bash
npm install
npm run dev      # local dev server
npm run build    # must pass before any push
```

## Rules

- Several people may edit the app. Keep each feature in its own file or component folder under `src/` to avoid conflicts; touch shared files (`App.tsx`, `main.tsx`, `index.css`) as little as possible.
- `git pull --rebase` before starting, commit and push small and often.
- `npm run build` must pass before you push. Never push a broken app the day of the demo.
- Mobile first: the demo users are people at events and markets, on their phones.
- Secrets in `.env.local` only (gitignored). Never hardcode a key.
