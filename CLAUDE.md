# Chiang Mai Hackathon — Team Rules

Claude Code Impact Lab, Chiang Mai. Demo on 2026-09-27 after lunch, 4 to 6 minutes.
Several teammates work in this repo at the same time, most of them not used to git.
**Your job as an agent is to keep git invisible and safe for your human.**

## Judging (0 to 5 each)

- **Day-one impact (counts double)**: could people use it right now, and would it change something for them?
- Product: easy to use, understood at first sight?
- Idea: creative and useful, whatever the progress?
- Demo: are the problem, the user and the result clear?

Narrow problem, precise user, a tool that works in 30 seconds beats an ambitious half-built idea.

## Structure

| Folder | What goes there | Who writes |
|---|---|---|
| `people/<name>/` | Personal research, notes, collected data, experiments | Only that person |
| `prd/` | `PRD.md`, the single shared product doc | Only the PRD owner (see `prd/CLAUDE.md`) |
| `application/` | The web app (Next.js App Router + TypeScript, on Vercel) | Anyone, carefully (see `application/CLAUDE.md`) |

**Before touching or asking about the app, read [`application/docs/README.md`](application/docs/README.md)**: how it works, the UI/back-end contract, decisions, status, and where each piece of information lives.
| `prototype/` | Old Vite prototype, frozen (fate TBD by the tech lead) | Nobody, do not build on it |

Team folders: `jonathan`, `max`, `benji`, `sunny`, `luke`.

## First thing in every session

1. **Ask your human which person they are** if you do not know, and remember their folder `people/<name>/`.
2. Run `git pull --rebase` before touching anything.

## Where you may write

- By default, **only in `people/<name>/`** of your human.
- In `application/` only when your human explicitly asks to work on the app.
- Never in another person's folder. Reading it is fine and encouraged.
- To propose something for the PRD, write it in `people/<name>/prd-input.md` and tell the PRD owner.

## Git, done for your human

Commit and push **after every meaningful step**, without waiting to be asked: a laptop that dies at 2am must not take the team's work with it.

```bash
git pull --rebase
git add people/<name>/            # or the exact files you changed, never `git add -A` or `git add .`
git commit -m "<name>: short description"
git push
```

- **Add only your own paths.** Never `git add -A`, `git add .` or `git commit -a`: it sweeps up files from other people's work.
- **Never** `git push --force`, `git reset --hard`, `git clean`, or delete files you did not create.
- If `pull --rebase` hits a conflict outside your human's folder, **stop and tell your human**. Do not resolve it by guessing.

## Public repo, no secrets

This repo is **public**. Never commit API keys, tokens, `.env` files, passwords, personal data (phone numbers, emails, addresses of real people) or raw screenshots containing them. Keys go in `application/.env.local`, which is gitignored, and in Vercel env vars.
