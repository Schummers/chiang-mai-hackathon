# U Mueang app docs

For teammates and their agents. Read this page first, then only the file you need.

| File | Read it when you want to know |
|---|---|
| [architecture.md](architecture.md) | How a Turn flows through the app, what each folder and file does |
| [contract.md](contract.md) | The UI <-> back-end contract: types, API routes, env vars, timeouts |
| [context-pack.md](context-pack.md) | How Luke's Lanna data becomes cards and prompt context |
| [decisions.md](decisions.md) | What was decided, why, and what is still open |
| [status.md](status.md) | What works, what is mocked, what is missing or unverified |

## Where each piece of information lives

These docs point to sources, they do not copy them. When two places disagree, the source below wins.

| Topic | Source of truth | Owner |
|---|---|---|
| What we build and for whom | [`prd/PRD.md`](../../prd/PRD.md) | jonathan |
| V1 spec, acceptance criteria | GitHub issue #1 (`gh issue view 1`) | jonathan |
| Back-end ticket | GitHub issue #12 | tech lead |
| Demo readiness | GitHub issue #13 | team |
| Team words (Visitor, Vendor, Turn, My info, Context Pack...) | [`people/jonathan/CONTEXT.md`](../../people/jonathan/CONTEXT.md) | jonathan |
| Visuals (Kratip direction, tokens, components) | [`people/jonathan/design system/DESIGN.md`](../../people/jonathan/design%20system/DESIGN.md) | jonathan |
| Screen flow (wins over DESIGN.md on flow) | [`people/jonathan/wireframes/v5.html`](../../people/jonathan/wireframes/v5.html) | jonathan |
| Design tickets in progress | [`people/jonathan/tickets/kratip/`](../../people/jonathan/tickets/kratip/) | jonathan |
| Lanna local knowledge (raw data, sources, confidence) | [`people/luke/lanna-context/`](../../people/luke/lanna-context/) | luke |
| UI <-> back-end types | [`lib/engine/types.ts`](../lib/engine/types.ts) | anyone, with care |
| Front-end handoff (history) | [`people/jonathan/handoff-frontend.md`](../../people/jonathan/handoff-frontend.md) | jonathan |
| Team and git rules | root [`CLAUDE.md`](../../CLAUDE.md) | team |

## Keeping this true

- A change to the contract, the Turn flow or a decision updates the matching file here **in the same commit**.
- Code wins over these docs. If you find a gap, fix the doc, do not work around it.
- Never write in another person's folder to fix a source: tell its owner.
